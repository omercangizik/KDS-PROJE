const dbConn = require("../db/mysql_connect");
const bcrypt = require("bcrypt");
const Response = require("../utils/response");
const { promisify } = require("util");

// dbConn.query'i promisify ederek kullanın
const query = promisify(dbConn.query).bind(dbConn);

const login = async (req, res) => {
    const kullanici_adi = req.body.kullanici_adi;
    const sifre = req.body.sifre;

    try {
        const results = await query("SELECT * FROM users WHERE kullanici_adi=?", [kullanici_adi]);

        if (results.length > 0) {
            const comparePassword = await bcrypt.compare(sifre, results[0].sifre);

            if (comparePassword) {
                return new Response(results[0]).basarili_giris(res); // Başarılı giriş
            } else {
                return res.status(203).json({
                    success: false,
                    message: "Kullanıcı veya Şifre Uyumsuz"
                });
            }
        } else {
            return res.status(203).json({
                success: false,
                message: "Kullanıcı Girişi Başarısız"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Bir hata oluştu."
        });
    }
};

const register = async (req, res) => {
    const kullanici_adi = req.body.kullanici_adi;
    const sifre = await bcrypt.hash(req.body.sifre, 10);
    const eposta = req.body.eposta;
    const adi = req.body.adi;
    const soyadi = req.body.soyadi;
    const tel_no = req.body.tel_no;
    const cinsiyet = req.body.cinsiyet;
    const dogum_tarihi = req.body.dogum_tarihi;

    try {
        const existingUser = await query("SELECT * FROM users WHERE kullanici_adi=?", [kullanici_adi]);

        if (existingUser.length > 0) {
            return new Response(existingUser).duplicated(res);
        } else {
            const result = await query("INSERT INTO users (kullanici_adi, sifre, eposta, adi, soyadi, tel_no, cinsiyet, dogum_tarihi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                [kullanici_adi, sifre, eposta, adi, soyadi, tel_no, cinsiyet, dogum_tarihi]);

            return new Response(result).created(res);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Bir hata oluştu"
        });
    }
};


const updateUser = async (req, res) => {
    const { kullanici_adi, sifre, eposta, adi, soyadi, tel_no, cinsiyet, dogum_tarihi } = req.body;

    try {
        const existingUser = await query("SELECT * FROM users WHERE kullanici_adi = ?", [kullanici_adi]);

        if (existingUser.length === 0) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        }

        const hashedPassword = sifre ? await bcrypt.hash(sifre, 10) : existingUser[0].sifre;

        await query(
            "UPDATE users SET sifre = ?, eposta = ?, adi = ?, soyadi = ?, tel_no = ?, cinsiyet = ?, dogum_tarihi = ? WHERE kullanici_adi = ?",
            [hashedPassword, eposta, adi, soyadi, tel_no, cinsiyet, dogum_tarihi, kullanici_adi]
        );

        return res.status(200).json({ success: true, message: "Kullanıcı bilgileri güncellendi" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Bir hata oluştu" });
    }
};





// Tedarikçi İşlemleri

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const results = await query("SELECT * FROM tedarikciler");
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new supplier
const addSupplier = async (req, res) => {
    const supplier = req.body;
    try {
        const results = await query("INSERT INTO tedarikciler SET ?", supplier);
        res.status(201).json({ id: results.insertId, ...supplier });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an existing supplier
const updateSupplier = async (req, res) => {
    const { id } = req.params;
    const supplier = req.body;
    try {
        const results = await query("UPDATE tedarikciler SET ? WHERE tedarikci_id = ?", [supplier, id]);
        if (results.affectedRows > 0) {
            res.json({ message: "Tedarikçi güncellendi." });
        } else {
            res.status(404).json({ error: "Tedarikçi bulunamadı." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a supplier
const deleteSupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const results = await query("DELETE FROM tedarikciler WHERE tedarikci_id = ?", [id]);
        if (results.affectedRows > 0) {
            res.json({ message: "Tedarikçi silindi." });
        } else {
            res.status(404).json({ error: "Tedarikçi bulunamadı." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Update a supplier with change detection
const updateSupplierWithChanges = async (req, res) => {
    const { id } = req.params;
    const newSupplierData = req.body;

    try {
        // Eski tedarikçi verisini al
        const oldSupplierData = await query("SELECT * FROM tedarikciler WHERE tedarikci_id = ?", [id]);
        if (oldSupplierData.length === 0) {
            return res.status(404).json({ error: "Tedarikçi bulunamadı." });
        }

        const oldSupplier = oldSupplierData[0];

        // Veriyi güncelle
        const results = await query("UPDATE tedarikciler SET ? WHERE tedarikci_id = ?", [newSupplierData, id]);

        if (results.affectedRows > 0) {
            // Değişiklikleri kontrol et
            const changes = {};
            for (let key in oldSupplier) {
                if (key !== "tedarikci_id" && oldSupplier[key] !== newSupplierData[key]) {
                    changes[key] = oldSupplier[key] < newSupplierData[key] ? "yükseldi" : "düştü";
                }
            }

            res.json({ message: "Tedarikçi güncellendi.", changes });
        } else {
            res.status(400).json({ error: "Güncelleme başarısız." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};



const getCriteriaCounts = (req, res) => {
    const { kriter } = req.query;  // Kullanıcıdan gelen kriteri al

    // Kriterin geçerli olup olmadığını kontrol et
    const validCriteria = ['kalite', 'fiyat', 'hiz', 'guvenilir_hizmet', 'kapasite',
        'hatali_urun','belge','talep', 'stok','gecmis_donem',   ];
    if (!validCriteria.includes(kriter)) {
        return res.status(400).json({ error: 'Geçersiz kriter seçimi.' });
    }

    // Dinamik SQL sorgusunu oluştur
    const query = `
        SELECT ${kriter}, COUNT(*) as count
        FROM tedarikciler
        GROUP BY ${kriter}
    `;

    dbConn.query(query, (err, results) => {
        if (err) {
            console.error('SQL Hatası (criteria-counts):', err.message);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
        }
        res.json(results);
    });
};


/**
 * İki Kriter Arasındaki İlişki
 */
const getCriteriaRelationship = (req, res) => {
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
            console.error('SQL Hatası (criteria-relationship):', err.message);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
        }
        res.json(results);
    });
};

/**
 * Tavsiye Edilme Sayıları
 */
const getRecommendationCounts = (req, res) => {
    const query = `
        SELECT tavsiye, COUNT(*) as count 
        FROM tedarikciler 
        GROUP BY tavsiye
    `;
    dbConn.query(query, (err, results) => {
        if (err) {
            console.error('SQL Hatası (recommendation-counts):', err.message);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
        }
        res.json(results);
    });
};


// Get all supplier information from tedarikci_bilgi
const getSupplierInfo = async (req, res) => {
    try {
        const results = await query("SELECT * FROM tedarikci_bilgi ORDER BY id");
        console.log(results);  // Verileri konsola yazdır
        res.json(results);  // Verileri JSON formatında döndürüyoruz
    } catch (error) {
        console.error("Veritabanı hatası:", error);
        res.status(500).json({ error: error.message });
    }
};







// const getSuppliers = async (req, res) => {
//     try {
//         const results = await query("SELECT * FROM tedarikciler");
//         res.json(results);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Add a new supplier
const addSupplierEvaluation = async (req, res) => {
    const supplier = req.body;
    console.log('Gönderilen Tedarikçi Verisi:', supplier); // Gelen veriyi kontrol et
    try {
        const results = await query("INSERT INTO tedarikci_bilgi SET ?", supplier);
        res.status(201).json({ id: results.insertId, ...supplier });
    } catch (error) {
        console.error('Hata: ', error); // Hata mesajını konsola yazdır
        res.status(500).json({ error: error.message });
    }
};



// Update an existing supplier
const updateSupplierEvaluation = async (req, res) => {
    const { id } = req.params;
    const supplier = req.body;
    try {
        const results = await query("UPDATE tedarikci_bilgi SET ? WHERE id = ?", [supplier, id]);
        if (results.affectedRows > 0) {
            res.json({ message: "Tedarikçi güncellendi." });
        } else {
            res.status(404).json({ error: "Tedarikçi bulunamadı." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a supplier
const deleteSupplierEvaluation = async (req, res) => {
    const { id } = req.params;
    try {
        const results = await query("DELETE FROM tedarikci_bilgi WHERE id = ?", [id]);
        if (results.affectedRows > 0) {
            res.json({ message: "Tedarikçi silindi." });
        } else {
            res.status(404).json({ error: "Tedarikçi bulunamadı." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



























module.exports = {
    getSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    login,
    register,
    updateSupplierWithChanges,// Yeni endpoint
    getRecommendationCounts,
    getCriteriaRelationship,
    getCriteriaCounts,
    updateUser,
    getSupplierInfo,
    addSupplierEvaluation,
    updateSupplierEvaluation,
    deleteSupplierEvaluation
};
