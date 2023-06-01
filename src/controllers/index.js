const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../database');

exports.getIndexing = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]
        const findData = `SELECT COUNT(*) AS count FROM TBL_BCA_KURS WHERE tanggal = '${today}'`
        db.query(findData, (err, result) => {
            if (err) {
                throw err
            }
            if (result[0].count > 0) {
                return res.status(200).send({
                    status: 'success',
                    message: 'Data untuk hari ini sudah tersedia'
                })
            }
        })

        const response = await axios.get('https://www.bca.co.id/id/informasi/kurs');
        const $ = cheerio.load(response.data);
        const kursList = [];

        $('.m-table-kurs > tbody > tr').each((index, element) => {
            const symbol = $(element).find('td:nth-child(1)').text().trim();
            const eRateBeli = parseFloat($(element).find('td:nth-child(2)').text().trim().replace(/\./g, '').replace(',', '.'));
            const eRateJual = parseFloat($(element).find('td:nth-child(3)').text().trim().replace(/\./g, '').replace(',', '.'));
            const ttCounterBeli = parseFloat($(element).find('td:nth-child(4)').text().trim().replace(/\./g, '').replace(',', '.'));
            const ttCounterJual = parseFloat($(element).find('td:nth-child(5)').text().trim().replace(/\./g, '').replace(',', '.'));
            const bankNotesBeli = parseFloat($(element).find('td:nth-child(6)').text().trim().replace(/\./g, '').replace(',', '.'));
            const bankNotesJual = parseFloat($(element).find('td:nth-child(7)').text().trim().replace(/\./g, '').replace(',', '.'));

            const kurs = {
                symbol: symbol,
                eRateBeli: eRateBeli,
                eRateJual: eRateJual,
                ttCounterBeli: ttCounterBeli,
                ttCounterJual: ttCounterJual,
                bankNotesBeli: bankNotesBeli,
                bankNotesJual: bankNotesJual,
                tanggal: today
            };
            kursList.push(kurs);
        });

        const insertQuery = "INSERT INTO TBL_BCA_KURS (symbol, eRate_jual, eRate_beli, ttCounter_jual, ttCounter_beli, bankNotes_jual, bankNotes_beli, tanggal) VALUES ? ";

        db.query(insertQuery, [kursList.map(Object.values)], (err, result) => {
            if (err) {
                console.log('Erro inserting data : ', err)
                return res.status(500).send({
                    status: 'failed',
                    message: 'Internal Server Error'
                })
            } else {

                const mapperData = kursList.map((item) => {
                    return {
                        "Symbol": item.symbol,
                        "e-Rate": {
                            "Beli": item.eRateBeli,
                            "Jual": item.eRateJual
                        },
                        "TT Counter": {
                            "Beli": item.ttCounterBeli,
                            "Jual": item.ttCounterJual
                        },
                        "Bank Notes": {
                            "Beli": item.bankNotesBeli,
                            "Jual": item.bankNotesJual
                        }
                    }
                })

                return res.status(200).send({
                    status: 'success',
                    message: 'Data sukses ditambahkan',
                    today: today,
                    data: mapperData

                })
            }
        })
        // db.end((err) => {
        //     if (err) {
        //         console.error('Error closing database connection:', err);
        //         return;
        //     }
        //     console.log('Database connection closed');
        // })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to scrape data' });
    }
}

exports.deleteIndexingByDate = async (req, res) => {
    try {
        const { tanggal } = req.params;

        const deleteQuery = 'DELETE FROM TBL_BCA_KURS WHERE tanggal = ?';
        const result = db.query(deleteQuery, tanggal);
        if (result.affectedRows === 0) {
            return res.status(200).send({
                status: 'failed',
                message: `Tidak ada data yang ditemukan untuk tanggal ${tanggal}`
            })
        }

        return res.status(200).send({
            status: 'success',
            message: 'Data berhasil di hapus'
        })
    } catch (error) {
        console.log("Delete data error :", error)
        return res.status(500).send({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.searchIndexingByRangeDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        const resultData = []
        const searchQuery = `SELECT * FROM TBL_BCA_KURS WHERE tanggal BETWEEN '${startDate}' AND '${endDate}'`

        db.query(searchQuery, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }


            const mapperData = results.map(item => {
                return {
                    "Symbol": item.symbol,
                    "Tanggal": item.tanggal,
                    "e-Rate": {
                        "Beli": item.eRate_beli,
                        "Jual": item.eRate_jual
                    },
                    "TT Counter": {
                        "Beli": item.ttCounter_beli,
                        "Jual": item.ttCounter_jual
                    },
                    "Bank Notes": {
                        "Beli": item.bankNotes_jual,
                        "Jual": item.bankNotes_beli
                    }
                }
            })

            if (mapperData.length === 0) {
                return res.status(200).send({
                    status: 'success',
                    message: 'Data tidak ditemukan'
                })
            }

            return res.status(200).send({
                status: 'success',
                message: 'Data ditemukan',
                data: mapperData,
                total: resultData.length
            })
        });

        // db.end((err) => {
        //     if (err) {
        //         console.error('Error closing database connection:', err);
        //         return;
        //     }
        //     console.log('Database connection closed');
        // })



    } catch (error) {
        console.log("Data error :", error)
        return res.status(500).send({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.searchIndexingBySymbolAndRangeDate = async (req, res) => {

    try {
        const { symbol } = req.params;
        const { startDate, endDate } = req.query
        const resultData = []
        const searchQuery = `SELECT * FROM TBL_BCA_KURS WHERE symbol = '${symbol}' AND  tanggal BETWEEN '${startDate}' AND '${endDate}'`

        db.query(searchQuery, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }


            const mapperData = results.map(item => {
                return {
                    "Symbol": item.symbol,
                    "Tanggal": item.tanggal,
                    "e-Rate": {
                        "Beli": item.eRate_beli,
                        "Jual": item.eRate_jual
                    },
                    "TT Counter": {
                        "Beli": item.ttCounter_beli,
                        "Jual": item.ttCounter_jual
                    },
                    "Bank Notes": {
                        "Beli": item.bankNotes_jual,
                        "Jual": item.bankNotes_beli
                    }
                }
            })


            if (mapperData.length === 0) {
                return res.status(200).send({
                    status: 'success',
                    message: 'Data tidak ditemukan'
                })
            }

            return res.status(200).send({
                status: 'success',
                message: 'Data ditemukan',
                data: mapperData,
                total: mapperData.length
            })
        });

        // db.end((err) => {
        //     if (err) {
        //         console.error('Error closing database connection:', err);
        //         return;
        //     }
        //     console.log('Database connection closed');
        // })


    } catch (error) {
        console.log("Data error :", error)
        return res.status(500).send({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.addIndexing = async (req, res) => {
    try {
        const { symbol, e_rate, tt_counter, bank_notes, tanggal } = req. body;

        // Validasi input
        if (!symbol || !e_rate || !tt_counter || !bank_notes || !tanggal) {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Missing required fields' 
            });
        }

        if (typeof symbol !== 'string' || typeof tanggal !== 'string') {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Invalid field type' 
            });
        }

        if (typeof e_rate !== 'object' || typeof tt_counter !== 'object' || typeof bank_notes !== 'object') {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Invalid field type' 
            });
        }

        if (typeof e_rate.jual !== 'number' || typeof e_rate.beli !== 'number' ||
            typeof tt_counter.jual !== 'number' || typeof tt_counter.beli !== 'number' ||
            typeof bank_notes.jual !== 'number' || typeof bank_notes.beli !== 'number') {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Invalid field type' 
            });
        }

        const checkQuery = `SELECT * FROM TBL_BCA_KURS WHERE symbol = '${symbol}' AND tanggal = '${tanggal}'`

        db.query(checkQuery, (err, results) => {
            if (err) {
                console.error("Error checking data: ", err)
                return res.status(500).send({
                    status: 'failed',
                    message: 'Intervel server error'
                })
            } else {
                console.log(results.length)
                if (results.length > 0) {
                    return res.status(200).send({
                        status: 'success',
                        message: 'Data sudah tersedia'
                    })
                } else {

                    const insertQuery = `INSERT INTO TBL_BCA_KURS (symbol, eRate_jual, eRate_beli, ttCounter_jual, ttCounter_beli, bankNotes_jual, bankNotes_beli, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                    const insertParams = [
                        symbol,
                        e_rate.jual,
                        e_rate.beli,
                        tt_counter.jual,
                        tt_counter.beli,
                        bank_notes.jual,
                        bank_notes.beli,
                        tanggal
                    ]

                    db.query(insertQuery, insertParams, (err, results) => {
                        if (err) {
                            console.log("Error add data Kurs: ", err)
                            return res.status(500).send({
                                status: 'failed',
                                message: 'Internal server error'
                            })
                        } else {
                            const data = {
                                "Symbol": symbol,
                                "e-Rate": {
                                    "Beli": e_rate.beli,
                                    "Jual": e_rate.jual
                                },
                                "TT Counter": {
                                    "Beli": tt_counter.beli,
                                    "Jual": tt_counter.jual
                                },
                                "Bank Notes": {
                                    "Beli": bank_notes.beli,
                                    "Jual": bank_notes.jual
                                },
                                "Tanggal": tanggal
                            }

                            return res.status(200).send({
                                status: 'success',
                                message: 'Data berhasil ditambahkan',
                                data: data
                            })
                        }
                    })
                    // db.end((err) => {
                    //     if (err) {
                    //         console.error('Error closing database connection:', err);
                    //         return;
                    //     }
                    //     console.log('Database connection closed');
                    // })
                }
            }
        })

    } catch (error) {
        console.log("Data error :", error)
        return res.status(500).send({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.editIndexing = async (req, res) => {
    try {
        const { symbol, e_rate, tt_counter, bank_notes, tanggal } = req. body;

        // Validasi input
        if (!symbol || !e_rate || !tt_counter || !bank_notes || !tanggal) {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Missing required fields' 
            });
        }

        if (typeof symbol !== 'string' || typeof tanggal !== 'string') {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Invalid field type' 
            });
        }

        if (typeof e_rate !== 'object' || typeof tt_counter !== 'object' || typeof bank_notes !== 'object') {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Invalid field type' 
            });
        }

        if (typeof e_rate.jual !== 'number' || typeof e_rate.beli !== 'number' ||
            typeof tt_counter.jual !== 'number' || typeof tt_counter.beli !== 'number' ||
            typeof bank_notes.jual !== 'number' || typeof bank_notes.beli !== 'number') {
            return res.status(400).send({ 
                status: 'failed',
                message: 'Invalid field type' 
            });
        }

        const checkQuery = `SELECT * FROM TBL_BCA_KURS WHERE symbol = '${symbol}'`

        db.query(checkQuery, (err, results) => {
            if (err) {
                console.error("Error checking data: ", err)
                return res.status(500).send({
                    status: 'failed',
                    message: 'Intervel server error'
                })
            } else {
                if (results.length > 0) {
                    const updateQuery = `UPDATE TBL_BCA_KURS SET symbol = '${symbol}', eRate_jual = ${e_rate.jual}, eRate_beli = ${e_rate.beli}, ttCounter_jual = ${tt_counter.jual}, ttCounter_beli = ${tt_counter.beli}, bankNotes_jual = ${bank_notes.jual}, bankNotes_beli = ${bank_notes.beli}, tanggal = '${tanggal}' WHERE symbol = '${symbol}'`;

                    db.query(updateQuery, (err, results) => {
                        if(err){
                            console.error("Error update data: ", err)
                            return res.status(500).send({
                                status: 'failed',
                                message: 'Intervel server error'
                            })
                        } else {
                            const data = {
                                "Symbol": symbol,
                                "e-Rate": {
                                    "Beli": e_rate.beli,
                                    "Jual": e_rate.jual
                                },
                                "TT Counter": {
                                    "Beli": tt_counter.beli,
                                    "Jual": tt_counter.jual
                                },
                                "Bank Notes": {
                                    "Beli": bank_notes.beli,
                                    "Jual": bank_notes.jual
                                },
                                "Tanggal": tanggal
                            }

                            return res.status(200).send({
                                status: 'success',
                                message: 'Data berhasil diupdate',
                                data: data
                            })
                        }
                    })
                } else {
                    return res.status(404).json({ 
                        status: 'failed',
                        message: 'Data not found' });
                }
            }
        })
    } catch (error) {
        console.log("Data error :", error)
        return res.status(500).send({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}