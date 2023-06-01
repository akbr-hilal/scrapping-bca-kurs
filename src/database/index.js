const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

db.connect((err) => {
    if (err) {
        console.error('Error connection to database', err)
        return;
    }
    console.log('Connected to database')
})

db.query(
    `CREATE TABLE IF NOT EXISTS TBL_BCA_KURS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(255) NOT NULL,
        eRate_jual DECIMAL(10, 2) NOT NULL,
        eRate_beli DECIMAL(10, 2)NOT NULL,
        ttCounter_jual DECIMAL(10, 2) NOT NULL,
        ttCounter_beli DECIMAL(10, 2) NOT NULL,
        bankNotes_jual DECIMAL(10, 2) NOT NULL,
        bankNotes_beli DECIMAL(10, 2) NOT NULL,
        tanggal VARCHAR(255) NOT NULL
    )`,
    (err) => {
        if (err) {
            throw err
        }
        console.log('Tabel kurs telah dibuat atau sudah ada');
    }
);

module.exports = db;