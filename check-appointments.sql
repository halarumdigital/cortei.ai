-- Query to check appointments for professionals

-- 1. Check all professionals
SELECT
    id,
    name,
    email,
    companyId
FROM professionals
ORDER BY id;

-- 2. Check all appointments
SELECT
    a.id,
    a.professionalId,
    a.companyId,
    a.clientName,
    a.appointmentDate,
    a.appointmentTime,
    s.name as serviceName,
    p.name as professionalName
FROM appointments a
LEFT JOIN services s ON a.serviceId = s.id
LEFT JOIN professionals p ON a.professionalId = p.id
ORDER BY a.appointmentDate DESC, a.appointmentTime DESC
LIMIT 20;

-- 3. Count appointments by professional
SELECT
    p.id as professionalId,
    p.name as professionalName,
    p.companyId,
    COUNT(a.id) as appointmentCount
FROM professionals p
LEFT JOIN appointments a ON a.professionalId = p.id AND a.companyId = p.companyId
GROUP BY p.id, p.name, p.companyId
ORDER BY appointmentCount DESC;

-- 4. Check appointments for a specific professional (replace ID and companyId)
-- SELECT
--     a.*,
--     s.name as serviceName
-- FROM appointments a
-- LEFT JOIN services s ON a.serviceId = s.id
-- WHERE a.professionalId = YOUR_PROFESSIONAL_ID
--   AND a.companyId = YOUR_COMPANY_ID
-- ORDER BY a.appointmentDate DESC, a.appointmentTime DESC;
