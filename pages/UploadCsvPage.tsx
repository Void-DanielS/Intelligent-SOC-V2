import React, { useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import UploadIcon from '../components/icons/UploadIcon';
import axios from 'axios';

const API_URL_UPLOAD = 'http://localhost:5000/api/upload';

const UploadCsvPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadMessage('');
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setUploadMessage('❌ Por favor, seleccione un archivo CSV primero.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('⏳ Subiendo y procesando...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(API_URL_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage(`✅ ${response.data.message || 'Archivo procesado con éxito.'}`);
    } catch (err: any) {
      console.error(err);
      const errorText = err.response?.data?.error || err.message;
      setUploadMessage(`❌ Error al subir: ${errorText}`);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  }, [selectedFile]);

  return (
    <div className="space-y-6">
      <Card title="Subir Archivo CSV de Tráfico de Red">
        <p className="text-dark-text-secondary mb-4">
          Cargue archivos CSV con datos de tráfico de red para análisis histórico o reentrenamiento de modelos.
        </p>

        <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <UploadIcon className="w-16 h-16 text-accent" />
          </div>
          <input
            type="file"
            id="csvUpload"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="csvUpload"
            className={`cursor-pointer inline-block px-6 py-3 rounded-md text-white font-medium transition-colors duration-150 ease-in-out
              ${isUploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-accent hover:bg-blue-600'}`}
          >
            {selectedFile ? `Archivo: ${selectedFile.name}` : 'Seleccionar Archivo CSV'}
          </label>
          {selectedFile && (
            <p className="text-sm text-dark-text-secondary mt-2">
              Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>

        {selectedFile && (
          <div className="mt-6 text-center">
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className={`px-8 py-3 rounded-md text-white font-semibold transition-colors duration-150 ease-in-out
                ${isUploading || !selectedFile
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isUploading ? 'Subiendo...' : 'Iniciar Carga y Procesamiento'}
            </button>
          </div>
        )}

        {uploadMessage && (
          <p
            className={`mt-4 text-center text-sm ${
              uploadMessage.startsWith('❌') ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {uploadMessage}
          </p>
        )}
      </Card>

      <Card title="Instrucciones para el Formato CSV">
        <p className="text-dark-text-secondary text-sm">
          Asegúrese de que su archivo CSV contenga estas columnas (o un subconjunto compatible con su modelo):
        </p>
        <ul className="list-disc list-inside mt-2 text-dark-text-secondary text-sm space-y-1">
          <li>
            <code>Source IP</code>, <code>Destination IP</code>, <code>Source Port</code>, <code>Destination Port</code>
          </li>
          <li>
            <code>Protocol</code>, <code>Flow Duration</code>, <code>Total Fwd Packets</code>, <code>Total Backward Packets</code>
          </li>
          <li>
            <code>Total Length of Fwd Packets</code>, <code>Total Length of Bwd Packets</code>, … y demás características numéricas.
          </li>
          <li>Opcionalmente una columna <code>Label</code> o <code>classification</code> para datos etiquetados.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          El backend Flask en <code>/api/upload</code> procesará este archivo, limpiará datos y re-entrenará los modelos.
        </p>
      </Card>
    </div>
  );
};

export default UploadCsvPage;
