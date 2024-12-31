const express = require("express");
const router = express.Router();
const { 
    login, 
    register, 
    getSuppliers, 
    addSupplier, 
    updateSupplier, 
    updateSupplierWithChanges, // Yeni fonksiyon
    deleteSupplier,getCriteriaCounts,getCriteriaRelationship,getRecommendationCounts,updateUser,getSupplierInfo,
    addSupplierEvaluation,updateSupplierEvaluation,deleteSupplierEvaluation
    
} = require('../controlers/controller'); // controllers klasörüne dikkat

// Tedarikçi İstekleri
router.get("/suppliers", getSuppliers);
router.post("/suppliers", addSupplier);
router.put("/suppliers/:id", updateSupplier);
router.put("/suppliers/updateWithChanges/:id", updateSupplierWithChanges); // Yeni endpoint
router.delete("/suppliers/:id", deleteSupplier);

// Kullanıcı İşlemleri
router.post('/login', login);
router.post('/register', register);

router.get('/criteria-counts', getCriteriaCounts);
router.get('/criteria-relationship', getCriteriaRelationship);
router.get('/recommendation-counts', getRecommendationCounts);

// routes.js
router.get('/getSupplierInfo', getSupplierInfo);


router.put('/user/update', updateUser);



router.post("/getSupplierInfo", addSupplierEvaluation);
router.put("/getSupplierInfo/:id", updateSupplierEvaluation);
router.delete("/getSupplierInfo/:id", deleteSupplierEvaluation);




module.exports = router;
