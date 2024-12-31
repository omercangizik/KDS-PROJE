class Response {
    constructor(data = null, message = null, status = null) {
        this.data = data;
        this.message = message;
        this.status = status;
    }

    created(res) {
        return res.status(201).json({
            success: true,
            data: null,
            message: this.message ?? "Kayıt Başarılı"
        });
    }

    duplicated(res) {
        return res.status(409).json({  // 409: Conflict
            success: false,
            data: null,
            message: this.message ?? "Kayıt Mevcut"
        });
    }

    basarili_giris(res) {
        return res.status(200).json({
            success: true,
            data: null,
            message: this.message ?? "Kullanıcı Girişi Başarılı"
        });
    }

    basarisiz_giris(res) {
        return res.status(403).json({  // 403: Forbidden
            success: false,
            data: null,
            message: this.message ?? "Kullanıcı ve Şifre Uyumsuz"
        });
    }
}

module.exports = Response;
