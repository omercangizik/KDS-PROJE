const express = require('express');
const path = require('path');
require('dotenv/config');
const router = require('./routers'); // routes.js dosyasını import ediyoruz
const app = express();


const cors = require('cors');
app.use(cors());  // CORS ayarlarını yaparak erişimi açın

// Middleware
app.use(express.static(path.join(__dirname, "public")));  // Public klasöründen dosya sunma
app.use(express.json({ limit: '50mb', extended: true }));  // JSON verisi için limit koyma

// Ana Sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// API Rotaları
app.use('/api', router);  // /api prefix'i ile gelen istekler routes.js'e yönlendirilecek

// Hata Yönetimi
app.use((err, req, res, next) => {
    console.error(err.stack);  // Hata loglarını konsola yazdırma
    res.status(500).json({ message: 'Sunucu hatası!', error: err.message });  // Hata mesajı döndürme
});

// Sunucu Ayarları
const PORT = process.env.PORT || 3000;  // PORT environment variable'dan veya 3000'den alır
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Tedarikçi verilerini almak için API endpoint
app.get('/api/suppliers/:id', (req, res) => {
    const supplierId = parseInt(req.params.id);
    const supplier = suppliers.find(s => s.tedarikci_id === supplierId);
    if (supplier) {
        res.json(supplier);
    } else {
        res.status(404).send('Tedarikçi bulunamadı');
    }
});


// Kriter Seçimi Sayıları
app.get('/api/criteria-counts', (req, res) => {
    const query = `
        SELECT kalite, COUNT(*) as count 
        FROM tedarikciler 
        GROUP BY kalite
    `;
    dbConn.query(query, (err, results) => {
        if (err) {
            console.error('SQL Hatası (criteria-counts):', err);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
        }
        res.json(results);
    });
});

// İki Kriter Arasındaki İlişki
app.get('/api/criteria-relationship', (req, res) => {
    const { kriter1, kriter2 } = req.query;

    if (!kriter1 || !kriter2) {
        return res.status(400).json({ error: 'Kriterler belirtilmedi.' });
    }

    const query = `
        SELECT ??, ??, COUNT(*) as count 
        FROM tedarikciler 
        GROUP BY ??, ??
    `;
    dbConn.query(query, [kriter1, kriter2, kriter1, kriter2], (err, results) => {
        if (err) {
            console.error('SQL Hatası (criteria-relationship):', err);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
        }
        res.json(results);
    });
});

// Tavsiye Edilme Sayıları
app.get('/api/recommendation-counts', (req, res) => {
    const query = `
        SELECT tavsiye, COUNT(*) as count 
        FROM tedarikciler 
        GROUP BY tavsiye
    `;
    dbConn.query(query, (err, results) => {
        if (err) {
            console.error('SQL Hatası (recommendation-counts):', err);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
        }
        res.json(results);
    });
});





