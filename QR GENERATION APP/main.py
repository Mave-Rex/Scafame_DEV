import tkinter as tk
from tkinter import filedialog, messagebox
import os
import pandas as pd
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image

def iniciar_gui():
    ventana = tk.Tk()
    ventana.title("Generador de Códigos QR")
    ventana.geometry("800x500")  # Tamaño de la ventana

    # Etiquetas
    tk.Label(ventana, text="Archivo Excel:").grid(row=0, column=0, padx=10, pady=10)
    tk.Label(ventana, text="Columna de datos:").grid(row=1, column=0, padx=10, pady=10)
    tk.Label(ventana, text="Carpeta de salida:").grid(row=2, column=0, padx=10, pady=10)

    # Entradas de texto
    entrada_archivo = tk.Entry(ventana, width=50)
    entrada_archivo.grid(row=0, column=1, padx=10, pady=10)
    entrada_columna = tk.Entry(ventana, width=50)
    entrada_columna.grid(row=1, column=1, padx=10, pady=10)
    entrada_carpeta = tk.Entry(ventana, width=50)
    entrada_carpeta.grid(row=2, column=1, padx=10, pady=10)

    # Botones
    tk.Button(ventana, text="Seleccionar Archivo", command=lambda: seleccionar_archivo(entrada_archivo)).grid(row=0, column=2, padx=10, pady=10)
    tk.Button(ventana, text="Seleccionar Carpeta", command=lambda: seleccionar_carpeta(entrada_carpeta)).grid(row=2, column=2, padx=10, pady=10)
    tk.Button(ventana, text="Generar QR", command=lambda: generar_qr(entrada_archivo, entrada_columna, entrada_carpeta)).grid(row=3, column=1, pady=20)

    ventana.mainloop()

def seleccionar_archivo(entrada_archivo):
    archivo = filedialog.askopenfilename(filetypes=[("Archivos Excel", "*.xlsx")])
    entrada_archivo.delete(0, tk.END)
    entrada_archivo.insert(0, archivo)

def seleccionar_carpeta(entrada_carpeta):
    carpeta = filedialog.askdirectory()
    entrada_carpeta.delete(0, tk.END)
    entrada_carpeta.insert(0, carpeta)

def generar_qr(entrada_archivo, entrada_columna, entrada_carpeta):
    archivo = entrada_archivo.get()
    columna = entrada_columna.get()
    carpeta = entrada_carpeta.get()

    if not archivo or not columna or not carpeta:
        messagebox.showerror("Error", "Por favor, completa todos los campos.")
        return

    try:
        # Leer el archivo Excel
        datos = pd.read_excel(archivo)
        if columna not in datos.columns:
            messagebox.showerror("Error", f"La columna '{columna}' no existe en el archivo.")
            return

        # Crear QR para cada fila
        for index, row in datos.iterrows():
            contenido = str(row[columna])
            nombre_archivo = f"{index + 1:05d}.png"  # Formato 00001, 00002, ...
            qr = qrcode.make(contenido)
            qr.save(os.path.join(carpeta, nombre_archivo))

        # Crear PDF con los QR
        pdf_path = os.path.join(carpeta, "Códigos_QR.pdf")
        crear_pdf(carpeta, pdf_path)

        messagebox.showinfo("Éxito", f"QR generados y guardados en: {carpeta}")

    except Exception as e:
        messagebox.showerror("Error", f"Ha ocurrido un error: {e}")



def crear_pdf(carpeta_qrs, pdf_path):
    c = canvas.Canvas(pdf_path, pagesize=A4)
    ancho, alto = A4
    x, y = 50, alto - 150

    for qr_file in sorted(os.listdir(carpeta_qrs)):
        if qr_file.endswith(".png"):
            img_path = os.path.join(carpeta_qrs, qr_file)
            c.drawImage(img_path, x, y, width=150, height=150)
            c.drawString(x, y - 20, qr_file.replace(".png", ""))
            y -= 200
            if y < 100:
                c.showPage()
                y = alto - 150

    c.save()

if __name__ == "__main__":
    iniciar_gui()
