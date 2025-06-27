# Intelligent-Soc-V2

Este proyecto implementa un SOC (Security Operations Center) inteligente que simula tráfico de red y lo clasifica en tiempo real como benigno o malicioso utilizando modelos de Machine Learning. Incluye un frontend en React + Vite, un backend en Python con Flask, y un simulador que genera tráfico automatizado. Fue desarrollado como parte del curso PACD.

## 🚀 Instrucciones de instalación y ejecución

1. Clonar el repositorio: git clone https://github.com/Void-DanielS/Intelligent-Soc-V2.git && cd Intelligent-Soc-V2  
2. Instalar dependencias de Python: pip install -r requirements.txt  
3. Iniciar el backend (Flask): python Backend/main.py  
4. Iniciar el frontend (React + Vite): npm install && npm run dev  
5. Ejecutar el simulador (opcional): python simulator.py  

## 📁 Estructura del proyecto

Intelligent-Soc-V2/  
├── Backend/  
│   ├── main.py  
│   ├── simulator.py  
│   ├── train_models.py  
│   ├── clean_data.py  
│   ├── requirements.txt  
│   ├── models/  
│   └── data/  
├── index.html  
├── package.json  
├── vite.config.ts  
├── App.tsx  
├── tsconfig.json  
├── node_modules/  
└── ...

## 🧠 Autores

Daniel Sebastian Cabrera Lazo, Lindo Marx Rojas Rojas, Priscila Cassiel Rojas Suarez, Tamara Bejar Ikeda   
Desarrollado como proyecto final del curso PACD – Universidad del Pacífico
