import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validatePositiveNumber,
} from "../middleware/errorHandler.js";

const router = express.Router();

// Get all mechanic certifications (public endpoint for badge wall)
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { mechanic_id, type, verified_only = "true" } = req.query;

    let query = `
      SELECT 
        mc.*,
        CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
        m.specialties as mechanic_specialties
      FROM mechanic_certifications mc
      JOIN mechanics m ON mc.mechanic_id = m.id
      WHERE mc.verification_status = 'verified'
    `;
    const params = [];

    if (mechanic_id) {
      query += " AND mc.mechanic_id = ?";
      params.push(mechanic_id);
    }

    if (type) {
      query += " AND mc.certification_type = ?";
      params.push(type);
    }

    if (verified_only === "true") {
      query += " AND mc.verification_status = 'verified'";
    }

    query += " ORDER BY mc.certification_type, mc.certification_name";

    const certifications = await executeQuery(query, params);

    // Group certifications by mechanic for badge wall display
    const groupedCertifications = certifications.reduce((acc, cert) => {
      const mechanicKey = cert.mechanic_id;
      if (!acc[mechanicKey]) {
        acc[mechanicKey] = {
          mechanic_id: cert.mechanic_id,
          mechanic_name: cert.mechanic_name,
          mechanic_specialties: cert.mechanic_specialties,
          certifications: [],
        };
      }
      acc[mechanicKey].certifications.push(cert);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        certifications: Object.values(groupedCertifications),
        total_count: certifications.length,
      },
    });
  })
);

// Get certifications by mechanic ID
router.get(
  "/mechanic/:mechanicId",
  optionalAuth,
  [param("mechanicId").isInt({ min: 1 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const mechanicId = req.params.mechanicId;

    // Check if mechanic exists
    const mechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    if (!mechanic) {
      throw new ValidationError("Mechanic not found");
    }

    const certifications = await executeQuery(
      `SELECT mc.*,
              CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM mechanic_certifications mc
       JOIN mechanics m ON mc.mechanic_id = m.id
       WHERE mc.mechanic_id = ?
       ORDER BY mc.certification_type, mc.issue_date DESC`,
      [mechanicId]
    );

    res.json({
      success: true,
      data: {
        mechanic: {
          id: mechanic.id,
          name: `${mechanic.first_name} ${mechanic.last_name}`,
          specialties: mechanic.specialties,
        },
        certifications,
      },
    });
  })
);

// Create new certification (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("mechanicId")
      .isInt({ min: 1 })
      .withMessage("Valid mechanic ID is required"),
    body("certificationName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Certification name must be at least 2 characters"),
    body("issuingOrganization")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Issuing organization is required"),
    body("certificationType")
      .isIn(["technical", "safety", "manufacturer", "industry", "specialty"])
      .withMessage("Invalid certification type"),
    body("certificateNumber")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Certificate number must not exceed 100 characters"),
    body("issueDate")
      .isISO8601()
      .withMessage("Valid issue date is required"),
    body("expiryDate")
      .optional()
      .isISO8601()
      .withMessage("Valid expiry date is required"),
    body("credentialUrl")
      .optional()
      .isURL()
      .withMessage("Valid credential URL is required"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("Valid image URL is required"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
    body("skillsCovered")
      .optional()
      .isArray()
      .withMessage("Skills covered must be an array"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const {
      mechanicId,
      certificationName,
      issuingOrganization,
      certificationType,
      certificateNumber,
      issueDate,
      expiryDate,
      credentialUrl,
      imageUrl,
      description,
      skillsCovered,
    } = req.body;

    // Check if mechanic exists
    const mechanic = await getSingleRecord(
      "SELECT id FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    if (!mechanic) {
      throw new ValidationError("Mechanic not found");
    }

    // Check if certificate number already exists (if provided)
    if (certificateNumber) {
      const existingCert = await getSingleRecord(
        "SELECT id FROM mechanic_certifications WHERE certificate_number = ?",
        [certificateNumber]
      );

      if (existingCert) {
        throw new ValidationError("Certificate number already exists");
      }
    }

    // Create certification
    const certificationId = await executeQuery(
      `INSERT INTO mechanic_certifications 
       (mechanic_id, certification_name, issuing_organization, certification_type, certificate_number, issue_date, expiry_date, credential_url, image_url, description, skills_covered, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified')`,
      [
        mechanicId,
        certificationName,
        issuingOrganization,
        certificationType,
        certificateNumber || null,
        issueDate,
        expiryDate || null,
        credentialUrl || null,
        imageUrl || null,
        description || null,
        skillsCovered ? JSON.stringify(skillsCovered) : null,
      ]
    );

    const newCertification = await getSingleRecord(
      `SELECT mc.*, CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM mechanic_certifications mc
       JOIN mechanics m ON mc.mechanic_id = m.id
       WHERE mc.id = ?`,
      [certificationId]
    );

    res.status(201).json({
      success: true,
      message: "Certification created successfully",
      data: { certification: newCertification },
    });
  })
);

// Update certification (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("certificationName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Certification name must be at least 2 characters"),
    body("issuingOrganization")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Issuing organization must be at least 2 characters"),
    body("certificationType")
      .optional()
      .isIn(["technical", "safety", "manufacturer", "industry", "specialty"])
      .withMessage("Invalid certification type"),
    body("certificateNumber")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Certificate number must not exceed 100 characters"),
    body("issueDate")
      .optional()
      .isISO8601()
      .withMessage("Valid issue date is required"),
    body("expiryDate")
      .optional()
      .isISO8601()
      .withMessage("Valid expiry date is required"),
    body("verificationStatus")
      .optional()
      .isIn(["verified", "pending", "expired", "revoked"])
      .withMessage("Invalid verification status"),
    body("credentialUrl")
      .optional()
      .isURL()
      .withMessage("Valid credential URL is required"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("Valid image URL is required"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
    body("skillsCovered")
      .optional()
      .isArray()
      .withMessage("Skills covered must be an array"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const certificationId = req.params.id;
    const updateFields = [];
    const updateValues = [];

    // Check if certification exists
    const existingCertification = await getSingleRecord(
      "SELECT * FROM mechanic_certifications WHERE id = ?",
      [certificationId]
    );

    if (!existingCertification) {
      throw new ValidationError("Certification not found");
    }

    const {
      certificationName,
      issuingOrganization,
      certificationType,
      certificateNumber,
      issueDate,
      expiryDate,
      verificationStatus,
      credentialUrl,
      imageUrl,
      description,
      skillsCovered,
    } = req.body;

    // Build dynamic update query
    if (certificationName !== undefined) {
      updateFields.push("certification_name = ?");
      updateValues.push(certificationName);
    }

    if (issuingOrganization !== undefined) {
      updateFields.push("issuing_organization = ?");
      updateValues.push(issuingOrganization);
    }

    if (certificationType !== undefined) {
      updateFields.push("certification_type = ?");
      updateValues.push(certificationType);
    }

    if (certificateNumber !== undefined) {
      // Check uniqueness if changing certificate number
      if (
        certificateNumber &&
        certificateNumber !== existingCertification.certificate_number
      ) {
        const existingCert = await getSingleRecord(
          "SELECT id FROM mechanic_certifications WHERE certificate_number = ? AND id != ?",
          [certificateNumber, certificationId]
        );

        if (existingCert) {
          throw new ValidationError("Certificate number already exists");
        }
      }
      updateFields.push("certificate_number = ?");
      updateValues.push(certificateNumber || null);
    }

    if (issueDate !== undefined) {
      updateFields.push("issue_date = ?");
      updateValues.push(issueDate);
    }

    if (expiryDate !== undefined) {
      updateFields.push("expiry_date = ?");
      updateValues.push(expiryDate);
    }

    if (verificationStatus !== undefined) {
      updateFields.push("verification_status = ?");
      updateValues.push(verificationStatus);
    }

    if (credentialUrl !== undefined) {
      updateFields.push("credential_url = ?");
      updateValues.push(credentialUrl);
    }

    if (imageUrl !== undefined) {
      updateFields.push("image_url = ?");
      updateValues.push(imageUrl);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }

    if (skillsCovered !== undefined) {
      updateFields.push("skills_covered = ?");
      updateValues.push(
        skillsCovered ? JSON.stringify(skillsCovered) : null
      );
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateValues.push(certificationId);

    // Update certification
    await executeQuery(
      `UPDATE mechanic_certifications SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    const updatedCertification = await getSingleRecord(
      `SELECT mc.*, CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM mechanic_certifications mc
       JOIN mechanics m ON mc.mechanic_id = m.id
       WHERE mc.id = ?`,
      [certificationId]
    );

    res.json({
      success: true,
      message: "Certification updated successfully",
      data: { certification: updatedCertification },
    });
  })
);

// Delete certification (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  [param("id").isInt({ min: 1 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const certificationId = req.params.id;

    // Check if certification exists
    const existingCertification = await getSingleRecord(
      "SELECT * FROM mechanic_certifications WHERE id = ?",
      [certificationId]
    );

    if (!existingCertification) {
      throw new ValidationError("Certification not found");
    }

    // Delete certification
    await executeQuery("DELETE FROM mechanic_certifications WHERE id = ?", [
      certificationId,
    ]);

    res.json({
      success: true,
      message: "Certification deleted successfully",
    });
  })
);

// Get certification statistics
router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    // Get certification type distribution
    const typeStats = await executeQuery(
      `SELECT certification_type, COUNT(*) as count
       FROM mechanic_certifications
       WHERE verification_status = 'verified'
       GROUP BY certification_type
       ORDER BY count DESC`
    );

    // Get mechanic with most certifications
    const topMechanics = await executeQuery(
      `SELECT 
         CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
         COUNT(mc.id) as certification_count,
         GROUP_CONCAT(mc.certification_name) as certifications
       FROM mechanics m
       LEFT JOIN mechanic_certifications mc ON m.id = mc.mechanic_id AND mc.verification_status = 'verified'
       WHERE m.is_active = TRUE
       GROUP BY m.id, m.first_name, m.last_name
       ORDER BY certification_count DESC
       LIMIT 5`
    );

    // Get upcoming expirations
    const upcomingExpirations = await executeQuery(
      `SELECT 
         mc.*,
         CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM mechanic_certifications mc
       JOIN mechanics m ON mc.mechanic_id = m.id
       WHERE mc.expiry_date IS NOT NULL
       AND mc.expiry_date <= DATE_ADD(NOW(), INTERVAL 90 DAY)
       AND mc.verification_status = 'verified'
       ORDER BY mc.expiry_date ASC`
    );

    res.json({
      success: true,
      data: {
        typeDistribution: typeStats,
        topMechanics,
        upcomingExpirations,
      },
    });
  })
);

export default router;