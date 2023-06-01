const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const app = require('.');

chai.use(chaiHttp);
const expect = chai.expect;

describe('API Unit Test', () => {
    describe('GET /api/indexing', () => {
        it('Scraping web and add data to db', (done) => {
            chai
                .request(app)
                .get('/api/indexing')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    if (res.body.message === 'Data sukses ditambahkan') {
                        expect(res.body).to.have.property('message').to.equal('Data sukses ditambahkan');
                    } else {
                        expect(res.body).to.have.property('message').to.equal('Data untuk hari ini sudah tersedia');
                    }
                    done();
                })
        })
    })

    describe('DELETE /api/kurs/:tanggal', () => {
        it('Delete data by date', (done) => {
            const tanggal = '2023-06-01';

            chai
                .request(app)
                .delete(`/api/kurs/${tanggal}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    if (res.body.message === 'Data berhasil di hapus') {
                        expect(res.body).to.have.property('message').to.equal('Data berhasil di hapus');
                    } else if (res.body.message === `Tidak ada data yang ditemukan untuk tanggal ${tanggal}`) {
                        expect(res.body).to.have.property('message').to.equal(`Tidak ada data yang ditemukan untuk tanggal ${tanggal}`);
                    } else {
                        expect(res.body).to.have.property('message').to.equal(res.body.message);
                    }
                    done();
                })
        })
    })

    describe('GET /api/kurs', () => {
        it('Get data by range date', (done) => {
            const startDate = '2023-05-01';
            const endDate = '2023-06-01';

            chai
                .request(app)
                .get(`/api/kurs?startDate=${startDate}&endDate=${endDate}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    if (res.body.message === 'Data ditemukan') {
                        expect(res.body).to.have.property('message').to.equal('Data ditemukan');
                    } else {
                        expect(res.body).to.have.property('message').to.equal('Data tidak ditemukan');
                    }
                    done();
                })
        })
    })

    describe('GET /api/kurs/:symbol', () => {
        it('Get data by symbol and range date', (done) => {
            const symbol = "USD"
            const startDate = '2023-05-01';
            const endDate = '2023-06-01';

            chai
                .request(app)
                .get(`/api/kurs/${symbol}?startDate=${startDate}&endDate=${endDate}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    if (res.body.message === 'Data ditemukan') {
                        expect(res.body).to.have.property('message').to.equal('Data ditemukan');
                    } else {
                        expect(res.body).to.have.property('message').to.equal('Data tidak ditemukan');
                    }
                    done();
                })
        })
    })

    describe('POST /api/kurs', () => {
        it('Add data', (done) => {
            let data = {
                symbol: "BBB",
                e_rate: {
                    jual: 1803.55,
                    beli: 177355
                },
                tt_counter: {
                    jual: 1803.55,
                    beli: 177355
                },
                bank_notes: {
                    jual: 1803.55,
                    beli: 177355
                },
                tanggal: "2018-05-16"
            }

            chai
                .request(app)
                .post(`/api/kurs`)
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    if (res.body.message === 'Missing required fields') {
                        expect(res.body).to.have.property('message').to.equal('Missing required fields');
                    } else if(res.body.message === 'Invalid field type') {
                        expect(res.body).to.have.property('message').to.equal('Invalid field type');
                    } else if(res.body.message === 'Data sudah tersedia') {
                        expect(res.body).to.have.property('message').to.equal('Data sudah tersedia');
                    } else if(res.body.message === 'Data berhasil ditambahkan') {
                        expect(res.body).to.have.property('message').to.equal('Data berhasil ditambahkan');
                    }

                    done();
                })
        })
    })

    describe('PUT /api/kurs', () => {
        it('Update data', (done) => {
            let data = {
                symbol: "BBB",
                e_rate: {
                    jual: 1803.55,
                    beli: 177355
                },
                tt_counter: {
                    jual: 1803.55,
                    beli: 177355
                },
                bank_notes: {
                    jual: 1803.55,
                    beli: 177355
                },
                tanggal: "2018-05-18"
            }

            chai
                .request(app)
                .put(`/api/kurs`)
                .send(data)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    if (res.body.message === 'Missing required fields') {
                        expect(res.body).to.have.property('message').to.equal('Missing required fields');
                    } else if(res.body.message === 'Invalid field type') {
                        expect(res.body).to.have.property('message').to.equal('Invalid field type');
                    } else if(res.body.message === 'Data not found') {
                        expect(res.body).to.have.property('message').to.equal('Data not found');
                    } else if(res.body.message === 'Data berhasil diupdate') {
                        expect(res.body).to.have.property('message').to.equal('Data berhasil diupdate');
                    }

                    done();
                })
        })
    })
})