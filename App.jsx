import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(
      (file) =>
        file.type === "image/jpeg" ||
        file.type === "image/png"
    );

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    addFiles(event.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const createPDF = async () => {
    if (!files.length) return;

    setLoading(true);

    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();

        let image;

        if (file.type === "image/jpeg") {
          image = await pdf.embedJpg(bytes);
        } else {
          image = await pdf.embedPng(bytes);
        }

        const width = image.width;
        const height = image.height;

        const page = pdf.addPage([width, height]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "doctool.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при создании PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          Doc<span>Tool</span>
        </div>

        <nav>
          <a href="#tools">Инструменты</a>
          <a href="#about">О сервисе</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="badge">
            ⚡ Быстро · Бесплатно · Приватно
          </div>

          <h1>
            Работа с документами
            <span> проще</span>
          </h1>

          <p>
            Конвертируйте, объединяйте и редактируйте
            документы прямо в браузере.
          </p>
        </section>

        <section className="converter">
          <div className="converter-title">
            <div className="title-icon">🖼️</div>

            <div>
              <h2>Изображения в PDF</h2>
              <p>
                JPG и PNG файлы можно объединить в один PDF
              </p>
            </div>
          </div>

          <label
            className={`dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
            />

            <div className="upload-icon">
              ↑
            </div>

            <h3>
              Перетащите изображения сюда
            </h3>

            <p>
              или <span>выберите файлы</span>
            </p>

            <small>
              Поддерживаются JPG и PNG
            </small>
          </label>

          {files.length > 0 && (
            <div className="file-section">
              <div className="file-header">
                <h3>
                  Файлы ({files.length})
                </h3>

                <button
                  className="clear"
                  onClick={clearFiles}
                >
                  Очистить
                </button>
              </div>

              <div className="file-list">
                {files.map((file, index) => (
                  <div
                    className="file-item"
                    key={`${file.name}-${index}`}
                  >
                    <div className="file-preview">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                      />
                    </div>

                    <div className="file-info">
                      <strong>{file.name}</strong>

                      <span>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <button
                      className="remove"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="convert-button"
            disabled={!files.length || loading}
            onClick={createPDF}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Создание PDF...
              </>
            ) : (
              <>
                Создать PDF
                <span>→</span>
              </>
            )}
          </button>

          <div className="privacy">
            🔒 Ваши файлы обрабатываются
            непосредственно в браузере
          </div>
        </section>

        <section className="tools" id="tools">
          <div className="section-heading">
            <p>ИНСТРУМЕНТЫ</p>
            <h2>
              Всё необходимое
              <br />
              для работы с PDF
            </h2>
          </div>

          <div className="tool-grid">
            <Tool
              icon="🔗"
              title="Объединить PDF"
              text="Соедините несколько PDF-файлов в один документ."
            />

            <Tool
              icon="✂️"
              title="Разделить PDF"
              text="Разделите большой документ на отдельные файлы."
            />

            <Tool
              icon="🗜️"
              title="Сжать PDF"
              text="Уменьшите размер документа для удобной отправки."
            />

            <Tool
              icon="🔄"
              title="Повернуть PDF"
              text="Измените ориентацию страниц документа."
            />

            <Tool
              icon="🗑️"
              title="Удалить страницы"
              text="Удалите ненужные страницы из PDF."
            />

            <Tool
              icon="📄"
              title="PDF → JPG"
              text="Превратите страницы PDF в изображения."
            />
          </div>
        </section>

        <section className="about" id="about">
          <div>
            <span>01</span>
            <h3>Без загрузки файлов</h3>
            <p>
              Документы обрабатываются непосредственно
              на вашем устройстве.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>Простой интерфейс</h3>
            <p>
              Никаких сложных настроек. Выберите файл
              и получите результат.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>Бесплатно</h3>
            <p>
              Основные инструменты доступны бесплатно.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          Doc<span>Tool</span>
        </div>

        <p>
          Простые инструменты для работы с документами.
        </p>

        <span>© 2026 DocTool</span>
      </footer>
    </div>
  );
}

function Tool({ icon, title, text }) {
  return (
    <div className="tool-card">
      <div className="tool-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button>
        Скоро <span>→</span>
      </button>
    </div>
  );
}

export default App;
