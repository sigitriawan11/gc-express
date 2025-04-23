import winston from "winston";
import path from 'path';

export const consoleLogger = winston.createLogger({
  level: 'debug', // Level log minimal yang akan ditampilkan
  format: winston.format.combine(
    winston.format.colorize(), // Memberi warna pada log pesan yang ditampilkan di konsol
    winston.format.simple() // Format log yang sederhana untuk tampilan konsol
  ),
  transports: [
    // Menampilkan log pesan pada konsol dengan level 'debug' dan lebih tinggi
    new winston.transports.Console({ level: 'debug' })
  ]
});

// Logger untuk menyimpan log pesan pada file
export const fileLogger = winston.createLogger({
  level: 'debug', // Level log minimal yang akan disimpan
  format: winston.format.combine(
    winston.format.timestamp(), // Menambahkan timestamp pada setiap log pesan
    winston.format.json() // Format log dalam bentuk JSON
  ),
  transports: [
    // Menyimpan log pesan pada file dengan level 'info' dan lebih tinggi
    new winston.transports.File({ filename: `logs/app.log`, level: 'info' })
  ]
});

const getLogFileName = (): string => {
  const today = new Date().toISOString().slice(0, 10); // Menghasilkan format 'YYYY-MM-DD'
  return path.join('logs', `app-${today}.log`);
};

// Variabel untuk menyimpan tanggal terakhir
let currentLogFile: string = getLogFileName();

// Fungsi untuk memperbarui transport jika hari berubah
const updateLoggerTransport = (logger: winston.Logger): void => {
  const newLogFile = getLogFileName();

  // Jika tanggal berubah, perbarui transport ke file log baru
  if (newLogFile !== currentLogFile) {
      currentLogFile = newLogFile;

      // Hapus transport lama
      logger.clear();

      // Tambahkan transport baru dengan nama file log baru
      logger.add(new winston.transports.File({
          filename: currentLogFile,
          level: 'info'
      }));
  }
};

// Buat logger
const fileLoggers: winston.Logger = winston.createLogger({
level: 'debug',
format: winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
),
transports: [
  new winston.transports.File({
    filename: currentLogFile, // Menggunakan file log berdasarkan tanggal hari ini
    level: 'info'
  })
]
});

export const fileLoggerInfo = (message: string): void => {
  // Periksa apakah hari telah berganti
  updateLoggerTransport(fileLoggers);

  // Menulis log
  fileLoggers.info(message);
};
