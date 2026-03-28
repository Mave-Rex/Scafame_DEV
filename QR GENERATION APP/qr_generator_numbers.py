import tkinter as tk
from tkinter import filedialog, messagebox
import pandas as pd
import qrcode
import json
import unicodedata
from fpdf import FPDF
from io import BytesIO
import tempfile

# Función para normalizar el texto (eliminar acentos y caracteres especiales)
def normalizar_texto(texto):
    return ''.join(
        c for c in unicodedata.normalize('NFKD', texto)
        if unicodedata.category(c) != 'Mn'
    )

# Función para generar un QR con los datos seleccionados (sin guardar como imagen)
def generar_qr(datos):
    # Normalizar los datos para evitar caracteres especiales
    datos_normalizados = {k: normalizar_texto(str(v)) for k, v in datos.items()}
    datos_json = json.dumps(datos_normalizados)  # Serializa los datos como JSON
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(datos_json)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Guardar el QR en un objeto de memoria en lugar de un archivo
    img_bytes = BytesIO()
    img.save(img_bytes)
    img_bytes.seek(0)  # Volver al principio del archivo en memoria
    return img_bytes

class ExcelReaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Generador de QR desde Excel")
        self.root.geometry("600x650")

        self.excel_file = None
        self.df = None
        self.fields_loaded = {}  # Diccionario para controlar si los campos ya se cargaron por hoja

        self.sheet_name_var = tk.StringVar()

        # Botón para abrir archivo Excel
        self.open_button = tk.Button(self.root, text="Abrir archivo Excel", command=self.load_excel)
        self.open_button.pack(pady=10)

        # Label para mostrar el nombre de la hoja seleccionada
        self.sheet_label = tk.Label(self.root, text="Selecciona una hoja")
        self.sheet_label.pack(pady=5)

        # Dropdown para seleccionar hoja
        self.sheet_dropdown = tk.OptionMenu(self.root, self.sheet_name_var, [])
        self.sheet_dropdown.pack(pady=5)

        # Frame para los checkboxes
        self.checklist_frame = tk.Frame(self.root)
        self.checklist_frame.pack(pady=10, fill=tk.BOTH, expand=True)

        # Botón para generar PDF con los QR
        self.generate_pdf_button = tk.Button(self.root, text="Generar QR y PDF", command=self.generate_qr_pdf, state=tk.DISABLED)
        self.generate_pdf_button.pack(pady=10)

        # Actualizar cuando cambia la hoja seleccionada
        self.sheet_name_var.trace("w", self.on_sheet_change)

    def load_excel(self):
        """Carga el archivo Excel y obtiene las hojas disponibles."""
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            try:
                self.excel_file = file_path
                self.df = pd.read_excel(self.excel_file, sheet_name=None, header=None)  # Lee todas las hojas sin asumir encabezados
                sheet_names = list(self.df.keys())
                
                # Actualizar opciones de hojas en el dropdown
                self.sheet_name_var.set(sheet_names[0])  # Set default sheet
                menu = self.sheet_dropdown["menu"]
                menu.delete(0, "end")
                for sheet in sheet_names:
                    menu.add_command(label=sheet, command=tk._setit(self.sheet_name_var, sheet))
                
                self.sheet_label.config(text="Selecciona una hoja:")
            except Exception as e:
                messagebox.showerror("Error", f"No se pudo cargar el archivo: {e}")

    def detect_header_row(self, sheet_data):
        """Detecta automáticamente la fila de encabezados con más celdas no vacías."""
        max_non_empty = 0
        header_row_index = None
        for i, row in sheet_data.iterrows():
            non_empty_cells = row.notna().sum()
            if non_empty_cells > max_non_empty:
                max_non_empty = non_empty_cells
                header_row_index = i
        return header_row_index

    def load_fields(self):
        """Carga los campos (nombres de columna) de la hoja seleccionada en los checkboxes."""
        sheet_name = self.sheet_name_var.get()

        # Borrar checkboxes anteriores
        for widget in self.checklist_frame.winfo_children():
            widget.destroy()

        # Si los campos ya se cargaron para esta hoja, no cargar nuevamente
        if sheet_name in self.fields_loaded:
            return

        sheet_data = self.df[sheet_name]
        
        # Detectar la fila con encabezados
        header_row_index = self.detect_header_row(sheet_data)
        if header_row_index is None:
            messagebox.showwarning("Advertencia", "No se detectaron encabezados válidos.")
            return
        
        # Reasignar encabezados al DataFrame
        sheet_data.columns = sheet_data.iloc[header_row_index]
        self.df[sheet_name] = sheet_data  # Actualizar el DataFrame solo con los encabezados
        
        # Crear nuevos checkboxes para las columnas de la hoja seleccionada
        self.fields = []
        for col in sheet_data.columns:
            var = tk.BooleanVar()
            chk = tk.Checkbutton(self.checklist_frame, text=col, variable=var)
            chk.pack(anchor="w")
            self.fields.append((col, var))

        self.fields_loaded[sheet_name] = True  # Marcar que los campos han sido cargados para esta hoja
        self.generate_pdf_button.config(state=tk.NORMAL)

    def on_sheet_change(self, *args):
        """Se llama cuando cambia la hoja seleccionada en el dropdown."""
        # Limpiar los campos cargados
        self.fields_loaded = {}

        # Cargar los campos de la nueva hoja seleccionada
        self.load_fields()

    def generate_qr_pdf(self):
        """Genera los QR y los agrega al archivo PDF con campos de formulario para los números."""
        sheet_name = self.sheet_name_var.get()
        sheet_data = self.df[sheet_name]
        
        # Obtener las columnas seleccionadas
        selected_columns = [col for col, var in self.fields if var.get()]
        if not selected_columns:
            messagebox.showwarning("Advertencia", "No se seleccionaron columnas.")
            return
        
        # Crear PDF
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        x, y = 10, 10  # Posición inicial para los QR
        qr_per_row = 4  # 4 QR por fila
        qr_size = 40  # Tamaño de cada QR

        # Procesar todas las filas comenzando directamente desde los datos, sin omitir ninguna fila
        data_to_process = sheet_data[selected_columns]  # Todos los datos a procesar, sin omitir la primera fila de encabezados

        # Obtener el total de QR a generar
        total_qrs = len(data_to_process)

        for index, row in data_to_process.iterrows():
            # Normalizar los valores de las columnas antes de generar los QR
            qr_data = {normalizar_texto(col): normalizar_texto(str(row[col])) for col in selected_columns}
            
            # Generar el QR (sin guardarlo en el disco)
            img_bytes = generar_qr(qr_data)

            # Crear un archivo temporal para el QR
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
                temp_file.write(img_bytes.read())
                temp_file.close()

                # Agregar QR al PDF desde el archivo temporal
                pdf.image(temp_file.name, x=x, y=y, w=qr_size, h=qr_size)

                # Calcular el número con ceros a la izquierda
                qr_number = str(index + 1).zfill(len(str(total_qrs)))  # Numeración con ceros a la izquierda

                # Crear un campo de formulario para el número
                pdf.set_xy(x, y + qr_size + 3)  # Posición debajo del QR
                pdf.set_font("Arial", size=10)
                pdf.cell(10, 5, qr_number)  # Número del QR (comenzar desde 1, con ceros)

            # Ajustar la posición para el siguiente QR (en la misma fila o nueva fila)
            if (index + 1) % qr_per_row == 0:  # 4 QR por fila
                x = 10
                y += qr_size + 10  # Nueva fila, ajuste de altura
            else:
                x += qr_size + 10  # Mover a la derecha

            # Limitar el número de QR por página
            if y > 250:  # Si llegamos al final de la página
                pdf.add_page()
                x, y = 10, 10  # Reiniciar la posición

        pdf.output("qr_codes.pdf")
        messagebox.showinfo("Éxito", "QRs generados y guardados en 'qr_codes.pdf'")

# Crear la ventana principal
root = tk.Tk()
app = ExcelReaderApp(root)  
root.mainloop()
