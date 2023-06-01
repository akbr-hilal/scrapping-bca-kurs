const { getIndexing, deleteIndexingByDate, searchIndexingByRangeDate, searchIndexingBySymbolAndRangeDate, addIndexing, editIndexing } = require('../controllers');
const router = require('express').Router();

router.get('/indexing', getIndexing)
router.delete('/kurs/:tanggal', deleteIndexingByDate)
router.get('/kurs', searchIndexingByRangeDate);
router.get('/kurs/:symbol', searchIndexingBySymbolAndRangeDate)
router.post('/kurs', addIndexing)
router.put('/kurs',  editIndexing)
module.exports = router 