// Gerekli modüllerin import edilmesi
const mysql = require('mysql2');
const { faker } = require('@faker-js/faker');

// Veritabanı bağlantısı
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Şifrenizi buraya girin (şifre yoksa boş bırakın)
  database: 'kds'  // Veritabanı adınızı burada girin
});

// Tedarikçi verilerini oluşturma fonksiyonu
function generateSupplierData() {
  return {
    firma_adi: faker.company.name(),
    adres: faker.location.streetAddress(),
    telefon_numarasi: faker.phone.number(),
    e_posta: faker.internet.email(),
    web_sitesi: faker.internet.url(),
    iletisim_kisisi_adi: faker.name.firstName() + " " + faker.name.lastName(),
    pozisyon: faker.name.jobTitle(),
    iletisim_kisisi_telefonu: faker.phone.number(),
    iletisim_kisisi_eposta: faker.internet.email()
  };
}

// 30 tane tedarikçi verisi oluşturma
const suppliers = [];
for (let i = 0; i < 30; i++) {
  suppliers.push(generateSupplierData());
}

// Verileri veritabanına kaydetme
suppliers.forEach(supplier => {
  const query = `
    INSERT INTO tedarikci_bilgi (firma_adi, adres, telefon_numarasi, e_posta, web_sitesi, iletisim_kisisi_adi, pozisyon, iletisim_kisisi_telefonu, iletisim_kisisi_eposta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [
    supplier.firma_adi,
    supplier.adres,
    supplier.telefon_numarasi,
    supplier.e_posta,
    supplier.web_sitesi,
    supplier.iletisim_kisisi_adi,
    supplier.pozisyon,
    supplier.iletisim_kisisi_telefonu,
    supplier.iletisim_kisisi_eposta
  ], (err, results) => {
    if (err) {
      console.error('Veritabanı hatası: ', err);
    } else {
      console.log('Tedarikçi eklendi: ', supplier.firma_adi);
    }
  });
});

// Veritabanı bağlantısını kapatma
connection.end();
