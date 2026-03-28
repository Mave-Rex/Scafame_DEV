#FAME S.A.
#Creado por Miguel Gutiérrez y Martín Suquillo
#12/04/2024

import tkinter as tk
from PIL import Image, ImageTk
from tkinter import filedialog, messagebox, ttk
import pandas as pd
import qrcode
from qrcode.image.svg import SvgImage
import unicodedata
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF
from reportlab.lib.pagesizes import A2
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Image
from reportlab.lib.pagesizes import landscape
from PIL import Image
import os
import tempfile
from datetime import datetime
import threading
import queue
import sys
import textwrap 


# Función para normalizar el texto (eliminar acentos y caracteres especiales)
def normalizar_texto(texto):
    return ''.join(
        c for c in unicodedata.normalize('NFKD', texto)
        if unicodedata.category(c) != 'Mn'
    )

# Función para generar QRs con los datos seleccionados en formato SVG
def generar_qr(datos):
    # Normalizar los datos para evitar caracteres especiales
    datos_normalizados = {k: normalizar_texto(str(v)) for k, v in datos.items()}
    datos_texto = "\n".join([f"{k}: {v}" for k, v in datos_normalizados.items()])

    # Generar QR en formato SVG
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(datos_texto)
    qr.make(fit=True)

    img = qr.make_image(image_factory=qrcode.image.svg.SvgImage)

    # Guardar como archivo temporal SVG
    temp_svg = tempfile.NamedTemporaryFile(delete=False, suffix=".svg")
    img.save(temp_svg.name)
    return temp_svg.name, datos_texto


class ExcelReaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Generador de QRs FAME")
        
        # Deshabilitar redimensionamiento
        self.root.resizable(False, False)

        # Centrar la ventana en la pantalla
        window_width = 600
        window_height = 700
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width // 2) - (window_width // 2)
        y = (screen_height // 2) - (window_height // 2) - 45
        self.root.geometry(f"{window_width}x{window_height}+{x}+{y}")

        self.root.configure(bg="#FFFFFF")
        self.root.iconbitmap("./src/logo_fame.ico")

        self.excel_file = None
        self.df = None
        self.fields_loaded = {}  # Diccionario para controlar si los campos ya se cargaron por hoja

        self.sheet_name_var = tk.StringVar()

        self.logo_frame = tk.Frame(self.root, bg="#000000", height=100)
        self.logo_frame.pack(fill=tk.X)

        #Títulos y Diseño
        self.logo_label = tk.Label(self.logo_frame, text="FAME", font=("Arial Black", 16), fg="white", bg="#000000")
        self.logo_label.pack(side=tk.LEFT, padx=20)
        self.subtext_label = tk.Label(self.logo_frame, text="INDUSTRIA DE LA SEGURIDAD Y DEFENSA NACIONAL",
                                      font=("Arial", 9), fg="white", bg="#000000")
        self.subtext_label.pack(side=tk.LEFT)

        self.main_frame = tk.Frame(self.root, bg="#FFFFFF")
        self.main_frame.pack(expand=False, fill=tk.BOTH, padx=20, pady=10)

        self.title_label = tk.Label(self.main_frame, text="Generador de Códigos QR", font=("Arial Black", 17), fg="#000000", bg="#FFFFFF")
        self.title_label.pack(pady=0.5)

        image_path = "./src/logo_fame.png" 
        image = Image.open(image_path)
        image = image.resize((100, 100))
        photo = ImageTk.PhotoImage(image)

        label = tk.Label(root, image=photo)
        label.image = photo  
        label.pack()

        # Botón para abrir archivo Excel
        self.select_file_button = tk.Button(self.root, text="Seleccionar archivo Excel", command=self.load_excel,bg="black", fg="white", font=("Arial", 8, "bold"))
        self.select_file_button.pack(pady=10)

        self.selected_file_frame = tk.Frame(self.root, bg="#FFFFFF")
        self.selected_file_frame.pack(pady=5, padx=55, fill=tk.X)        
                
        # Label para mostrar el archivo Excel seleccionado
        self.selected_file_label = tk.Label(self.selected_file_frame, text="Ruta del archivo seleccionado:", font=("Arial", 9, "bold"), bg="#FFFFFF")
        self.selected_file_label.pack(side="left", padx=5)

        self.excel_file_var = tk.StringVar()  # Variable para almacenar la ruta
        self.excel_file_display = tk.Entry(self.selected_file_frame, textvariable=self.excel_file_var, state="readonly", width=50)
        self.excel_file_display.pack(side="left", padx=5)

        #Línea de seccionamiento
        self.crear_linea(self.root, color="grey", grosor=2, pady=5)

        # Campo para seleccionar hoja
        self.sheet_frame = tk.Frame(self.root, bg="#FFFFFF")
        self.sheet_frame.pack(pady=5, padx=65, fill=tk.X)
        # Label para mostrar el nombre de la hoja seleccionada
        self.sheet_label = tk.Label(self.sheet_frame, text="Seleccionar hoja del archivo:", font=("Arial", 9, "bold"), bg="#FFFFFF")
        self.sheet_label.pack(side="left", padx=5)

        self.sheet_dropdown = ttk.Combobox(self.sheet_frame, textvariable=self.sheet_name_var, state="readonly", width=20, font=("Arial", 9, "bold"))
        self.sheet_dropdown.pack(side="left", padx=5)

        def on_combobox_select(event):
            self.sheet_dropdown.master.focus_set()  # Este método mueve el foco fuera del combobox, lo desmarca

        # Vincula el evento de selección del combobox
        self.sheet_dropdown.bind("<<ComboboxSelected>>", on_combobox_select)

        # Frame para los checkboxes
        self.checklist_frame = tk.Frame(self.root, bg="#FFFFFF")
        self.checklist_frame.pack(pady=10, padx=30, fill=tk.BOTH, expand=True)
        
        # Campo para carpeta de salida
        self.crear_linea(self.root, color="grey", grosor=2, pady=5)

        #Boton para seleccionar donde guardar
        self.select_folder_button = tk.Button(self.root, text="Seleccionar donde guardar", command=self.select_output_folder,bg="black", fg="white", font=("Arial", 8, "bold"))
        self.select_folder_button.pack(pady=5)

        self.output_folder_frame = tk.Frame(self.root, bg="#FFFFFF")
        self.output_folder_frame.pack(pady=5, padx=70, fill=tk.X)

        #Label para mostrar la ruta de salida del PDF
        self.output_folder_label = tk.Label(self.output_folder_frame, text="Ruta de salida del archivo PDF:", font=("Arial", 9, "bold"), bg="#FFFFFF")
        self.output_folder_label.pack(side="left", padx=5)

        self.output_folder_var = tk.StringVar()  # Variable para almacenar la ruta
        self.output_folder_display = tk.Entry(self.output_folder_frame, textvariable=self.output_folder_var, state="readonly", width=50)
        self.output_folder_display.pack(side="left", padx=5)

        # Botón para generar PDF con los QR
        self.generate_pdf_button = tk.Button(self.root, text="Generar códigos QR", command=self.generate_qr_pdf, state=tk.DISABLED,bg="black", fg="white", font=("Arial", 8, "bold"))
        self.generate_pdf_button.pack(pady=10)

        # Actualizar cuando cambia la hoja seleccionada
        self.sheet_name_var.trace("w", self.on_sheet_change)

    # Creación de línea como diseño visual
    def crear_linea(self, parent, color="black", grosor=2, pady=10):
        """Crea una línea horizontal en un Canvas."""
        line_canvas = tk.Canvas(parent, height=grosor, bg=parent.cget("bg"), highlightthickness=0)
        line_canvas.pack(fill=tk.X, pady=pady)  # Ajustar el espaciado vertical
        line_canvas.create_line(0, 1, parent.winfo_width(), 1, fill=color, width=grosor)
        return line_canvas

    def load_excel(self):
        """Carga el archivo Excel y obtiene las hojas disponibles."""
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            self.excel_file_var.set(file_path)
            try:
                self.excel_file = file_path
                self.df = pd.read_excel(self.excel_file, sheet_name=None, header=None)  # Lee todas las hojas sin asumir encabezados
                sheet_names = list(self.df.keys())
                
                # Actualizar opciones de hojas en el Combobox
                self.sheet_name_var.set(sheet_names[0])  # Set default sheet
                self.sheet_dropdown['values'] = sheet_names  # Cargar las opciones al Combobox

                self.sheet_label.config(text="Seleccionar una hoja del archivo:", )
            except Exception as e:
                messagebox.showerror("Error", f"No se pudo cargar el archivo: {e}")


    def select_output_folder(self):
        """Permite seleccionar una carpeta de salida y mostrar su ruta."""
        folder_path = filedialog.askdirectory()
        if folder_path:
            self.output_folder_var.set(folder_path)  # Mostrar la ruta seleccionada en el Entry


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
        """Carga los campos (nombres de columna) de la hoja seleccionada en los checkboxes en un grid."""
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
            messagebox.showwarning("Advertencia", "No se detectaron campos válidos.")
            return

        # Reasignar encabezados al DataFrame
        sheet_data.columns = sheet_data.iloc[header_row_index]
        self.df[sheet_name] = sheet_data  # Actualizar el DataFrame solo con los encabezados

        selected_fields_label = tk.Label(self.checklist_frame, text="Seleccionar los campos requeridos:", padx=5, font=("Arial", 9, "bold"), bg="#FFFFFF")
        selected_fields_label.grid(row=0, column=0, columnspan=4, sticky="w", pady=5)

        # Crear nuevos checkboxes para las columnas de la hoja seleccionada en un grid layout
        self.fields = []
        max_columns = 3  # Define cuántas columnas debe haber en el grid
        row, col = 1, 0  # Comienza en la fila 1, columna 0

        # Configuración de grid dinámico
        for i in range(max_columns):
            self.checklist_frame.columnconfigure(i, weight=1, minsize=150)  # Distribuir columnas de manera equitativa

        # Ajustar la cantidad de filas y distribuir el contenido dinámicamente
        for col_name in sheet_data.columns:
            var = tk.BooleanVar()
            chk = tk.Checkbutton(self.checklist_frame, text=col_name, variable=var, bg="#FFFFFF", wraplength=150, justify="left", anchor="w")
            chk.grid(row=row, column=col, padx=5, pady=5, sticky="w")
            self.fields.append((col_name, var))

            # Avanzar a la siguiente columna
            col += 1
            if col >= max_columns:  # Cambiar a la siguiente fila si se alcanza el límite de columnas
                col = 0
                row += 1

        self.fields_loaded[sheet_name] = True  # Marcar que los campos han sido cargados para esta hoja
        self.generate_pdf_button.config(state=tk.NORMAL)

    def on_sheet_change(self, *args):
        """Se llama cuando cambia la hoja seleccionada en el dropdown."""
        # Limpiar los campos cargados
        self.fields_loaded = {}

        # Cargar los campos de la nueva hoja seleccionada
        self.load_fields()

    def generate_qr_pdf(self):
        """Genera los QR en un PDF con disposición de 9 columnas y filas ajustadas, con hoja A2 en horizontal utilizando ReportLab."""
        if not self.output_folder_var.get():
            messagebox.showerror("Error", "Por favor seleccione una carpeta de salida antes de generar el PDF.")
            return

        output_folder = self.output_folder_var.get()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")  # Formato: YYYYMMDD_HHMM
        pdf_filename = f"Códigos_QR_{timestamp}.pdf"
        pdf_path = os.path.join(output_folder, pdf_filename)

        sheet_name = self.sheet_name_var.get()
        sheet_data = self.df[sheet_name]

        # Obtener las columnas seleccionadas
        selected_columns = [col for col, var in self.fields if var.get()]
        if not selected_columns:
            messagebox.showwarning("Advertencia", "Por favor seleccione al menos un campo")
            return

        # Crear ventana de progreso
        progress_window = tk.Toplevel(self.root)
        progress_window.title("Generando PDF...")
        progress_window.geometry("400x120")
        progress_window.resizable(False, False)
        progress_window.transient(self.root)
        progress_window.grab_set()  # Bloquea interacción con la ventana principal

        progress_window.iconbitmap('./src/logo_fame.ico')

        # Centrar la ventana de progreso
        progress_window.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (progress_window.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (progress_window.winfo_height() // 2)
        progress_window.geometry(f"+{x}+{y}")

        # Etiqueta y barra de progreso
        progress_label = tk.Label(progress_window, text="Generando PDF, por favor espere...", font=("Arial", 10))
        progress_label.pack(pady=10)

        progress_bar = ttk.Progressbar(progress_window, orient="horizontal", length=300, mode="determinate")
        progress_bar.pack(pady=10)
        progress_bar["value"] = 0  # Valor inicial

        progress_window.update_idletasks()

        # Cola para comunicar el progreso entre los hilos
        progress_queue = queue.Queue()

        def generate_pdf_in_thread(sheet_data, selected_columns, progress_queue):
            margin = 20  # Definir el margen antes de su uso
            c = canvas.Canvas(pdf_path, pagesize=landscape(A2))  # A2 en horizontal
            width, height = landscape(A2)

            qr_size = 80
            column_count = 9  # Número fijo de columnas
            row_count = 5  # Número fijo de filas

            column_width = (width - 2 * margin) / column_count  # Espacio por columna
            row_height = (height - 2 * margin - 100) / row_count  # Espacio por fila (ajustando para el margen superior)

            header_margin = 100  # Margen superior para encabezado
            text_margin = 5  # Espacio entre el QR y el texto
            x, y = margin, height - header_margin - qr_size  # Coordenadas iniciales con margen superior

            header_row_index = self.detect_header_row(sheet_data)
            if header_row_index is None:
                progress_window.destroy()
                messagebox.showwarning("Advertencia", "No se detectaron encabezados válidos.")
                return

            # Reasignar encabezados y datos
            sheet_data.columns = sheet_data.iloc[header_row_index]
            sheet_data = sheet_data.iloc[header_row_index + 1:]

            total_rows = len(sheet_data)
            progress_step = 100 / total_rows if total_rows > 0 else 100

            column_tracker = 0
            row_tracker = 0

            for index, row in sheet_data.iterrows():
                qr_data = {normalizar_texto(col): normalizar_texto(str(row[col])) for col in selected_columns}
                qr_svg_path, qr_text = generar_qr(qr_data)

                # Convertir el SVG a un objeto de dibujo
                drawing = svg2rlg(qr_svg_path)

                # Dibujar el QR en el PDF
                renderPDF.draw(drawing, c, x, y)

                # Agregar texto debajo del QR, ahora ajustando líneas largas
                c.setFont("Helvetica", 6)  # Reducir tamaño de fuente si es necesario

                # Crear una lista de los campos para el texto
                wrapped_data = []
                for key, value in qr_data.items():
                    # Ajustar texto largo con un ancho máximo de caracteres
                    wrapped_text = textwrap.fill(f"{key}: {value}", width=int(column_width // 4))
                    wrapped_data.append(wrapped_text)

                # Combinar las líneas ajustadas
                formatted_data = "\n".join(wrapped_data)

                # Imprimir cada línea del texto
                text_lines = formatted_data.split("\n")
                text_height = y - text_margin

                for line in text_lines:
                    c.drawString(x, text_height, line)
                    text_height -= 10  # Espacio entre cada línea de texto

                # Ajustar las coordenadas para la siguiente columna
                column_tracker += 1
                if column_tracker == column_count:  # Pasar a la siguiente fila
                    column_tracker = 0
                    row_tracker += 1
                    x = margin
                    y -= row_height
                else:
                    x += column_width

                # Verificar si la página está llena
                if row_tracker == row_count:
                    c.showPage()  # Nueva página
                    x, y = margin, height - header_margin - qr_size
                    row_tracker = 0

                # Eliminar el archivo temporal del QR
                os.remove(qr_svg_path)

                # Enviar progreso a la cola
                progress_queue.put(progress_step)

            c.save()

            # Enviar mensaje de finalización del proceso
            progress_queue.put("done")
        
        def update_progress():
            try:
                progress = progress_queue.get_nowait()

                if progress == "done":
                    progress_window.destroy()
                    messagebox.showinfo("Éxito", f"PDF generado y guardado en: {pdf_path}")
                    return
                else:
                    progress_bar["value"] += progress
                    progress_window.after(50, update_progress)

            except queue.Empty:
                progress_window.after(50, update_progress)

        threading.Thread(target=generate_pdf_in_thread, args=(sheet_data, selected_columns, progress_queue), daemon=True).start()
        update_progress()

def crear_ventana_clave():
    def verificar_clave(event=None):
        clave_ingresada = entry_clave.get()
        clave_correcta = "1234admin"

        if not clave_ingresada:
            messagebox.showerror("Error", "El campo de clave está vacío. Por favor ingrese la clave.", parent=ventana_clave)
        elif clave_ingresada == clave_correcta:
            ventana_clave.destroy()
        else:
            messagebox.showerror("Acceso denegado", "Clave incorrecta. Intente nuevamente.", parent=ventana_clave)

    def alternar_visibilidad_clave():
        if entry_clave.cget("show") == "":
            entry_clave.config(show="*")
            boton_ver_clave.config(text="🔓")  # Icono para ocultar
        else:
            entry_clave.config(show="")
            boton_ver_clave.config(text="🔒")  # Icono para mostrar

    # Crear la ventana modal
    ventana_clave = tk.Tk()

    # Centrar la ventana
    window_width = 300  # Ancho de la ventana
    window_height = 150  # Alto de la ventana

    # Obtener dimensiones de la pantalla
    screen_width = ventana_clave.winfo_screenwidth()
    screen_height = ventana_clave.winfo_screenheight()

    # Calcular las coordenadas x e y para centrar
    x = (screen_width // 2) - (window_width // 2)
    y = (screen_height // 2) - (window_height // 2)-100

    # Configurar la geometría de la ventana
    ventana_clave.geometry(f"{window_width}x{window_height}+{x}+{y}")
    ventana_clave.title("Clave de Acceso")
    ventana_clave.resizable(False, False)
    ventana_clave.iconbitmap('./src/logo_fame.ico')  # Agregar ícono

    ventana_clave.configure(bg="#FFFFFF")

    # Etiqueta de instrucción
    etiqueta = tk.Label(ventana_clave, bg="#FFFFFF", text="Ingrese la clave de acceso:", font=("Arial", 8, "bold"))
    etiqueta.pack(pady=10)

    # Campo de entrada para la clave
    frame_clave = tk.Frame(ventana_clave, bg="#FFFFFF")
    frame_clave.pack(pady=5)

    entry_clave = tk.Entry(frame_clave, show="*", width=20)
    entry_clave.grid(row=0, column=0)

    entry_clave.bind("<Return>", verificar_clave)

    # Botón para alternar visibilidad de la clave
    boton_ver_clave = tk.Button(frame_clave, text="🔓", command=alternar_visibilidad_clave, width=2)
    boton_ver_clave.grid(row=0, column=1, padx=(5, 0))

    # Botón para verificar la clave
    boton_verificar = tk.Button(ventana_clave, text="Verificar", command=verificar_clave, bg="black", fg="white", font=("Arial", 8, "bold"))
    boton_verificar.pack(pady=10)

    # Foco en el campo de entrada
    entry_clave.focus_set()

    # Manejo de cierre de ventana para finalizar la aplicación
    def cerrar_aplicacion():
        ventana_clave.destroy()
        sys.exit()

    ventana_clave.protocol("WM_DELETE_WINDOW", cerrar_aplicacion)

    ventana_clave.mainloop()

# Ejecutar la ventana de clave al iniciar
crear_ventana_clave()

# Crear la ventana principal de la aplicación
root = tk.Tk()
app = ExcelReaderApp(root)
root.mainloop()
