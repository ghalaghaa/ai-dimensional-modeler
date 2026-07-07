SELECT
    "SQL1"."REM_ID" AS "REM_ID", 
    "SQL1"."REM_HASTATE" AS "REM_HASTATE", 
    "SQL1"."REM_HACITY" AS "REM_HACITY"
FROM
    (
    select REM_ID,REM_HASTATE,REM_HACITY  from fawri_stage..[FWR_tblM_REMMASTER] 
    ) "SQL1"("REM_ID", "REM_HASTATE", "REM_HACITY") 
GROUP BY 
    "SQL1"."REM_ID", 
    "SQL1"."REM_HASTATE", 
    "SQL1"."REM_HACITY"

SELECT
    "Branch"."Branch_Number", 
    "Branch"."Branch_Name"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Branch"

SELECT
    CAST("Customer_Details"."Remitter_Entity" AS NVARCHAR(20)), 
    "Customer_Details"."Issue_Date", 
    "Customer_Details"."Expiry_Date", 
    "Customer_ID_Details"."ID_Expiry_Date", 
    "Customer_Details"."SYMEX_Code", 
    "Customer_ID_Details"."ID_Type", 
    "Customer_ID_Details"."ID_Number", 
    "Customer_Details"."Nationality_Code", 
    CASE 
        WHEN "Customer_Details"."Gender" = 0 THEN 'Male'
        ELSE 'Female'
    END, 
    "Customer_Details"."First_Name", 
    "Customer_Details"."Middle_Name", 
    "Customer_Details"."Last_Name", 
    "Customer_Details"."Family_Name", 
    "Customer_Details"."Remitter_Status", 
    CASE 
        WHEN "Customer_Details"."Blocked" = 1 THEN 'BLOCKED'
        WHEN "Customer_Details"."Remitter_Status" = 0 THEN 'OPEN'
        WHEN "Customer_Details"."Remitter_Status" = 1 THEN 'APPROVED'
        WHEN "Customer_Details"."Remitter_Status" = 2 THEN 'REJECTED'
    END, 
    "Customer_Details"."Category", 
    "Customer_Details"."BAJ_Branch", 
    "Customer_Details"."Created_By", 
    "User_Details_Created_by"."User_Name", 
    "Customer_Details"."Local_Address_Mobile_No", 
    "Customer_Details"."Last_Txn_Date", 
    "Customer_Details"."Modified_On", 
    "Customer_Details"."Modified_By", 
    "User_Details_Modified_by"."User_Name", 
    "Country"."Country_Name", 
    CAST(CAST("Customer_Details"."Remitter_Entity" AS NVARCHAR(20)) AS VARCHAR(10)), 
    (CAST(CAST("Customer_Details"."Remitter_Entity" AS NVARCHAR(20)) AS VARCHAR(10)) + '-'), 
    CASE 
        WHEN 
            CAST("Customer_Details"."Nationality_Code" AS VARCHAR(10)) IS NULL OR
            "Country"."Country_Name" IS NULL
            THEN
                NULL
        ELSE ((CAST("Customer_Details"."Nationality_Code" AS VARCHAR(10)) + '-') + "Country"."Country_Name")
    END, 
    "Customer_Details"."CIF_Number", 
    "Customer_Details"."Created_On", 
    "Customer_Details"."Date_Of_Birth_Type", 
    "Customer_Details"."Date_Of_Birth_Hijri", 
    "Customer_Details"."Date_Of_Birth", 
    CASE 
        WHEN "Customer_Details"."Date_Of_Birth_Type" = 'H' THEN CAST("Customer_Details"."Date_Of_Birth_Hijri" AS NVARCHAR(10))
        ELSE CONVERT(NVARCHAR(10), "Customer_Details"."Date_Of_Birth", 121)
    END, 
    "Customer_ID_Details"."Profession_in_Iqama", 
    "Customer_ID_Details"."Profession_in_Iqama_List", 
    "Customer_Details"."Position_Job_Code", 
    "Profession_Lookup"."PROF_NAME", 
    "Customer_Details"."City", 
    "Beneficiary_Details"."State"
FROM
    "Fawri_Presentation"."dbo"."Customer_Details" "Customer_Details"
        INNER JOIN "Fawri_Presentation"."dbo"."Customer_ID_Details" "Customer_ID_Details"
        ON "Customer_Details"."SYMEX_Code" = "Customer_ID_Details"."SYMEX_Code"
            INNER JOIN "Fawri_Presentation"."dbo"."Customer_ID_Status" "ID_Status"
            ON "Customer_ID_Details"."ID_Type" = "ID_Status"."ID_Code"
                LEFT OUTER JOIN "Fawri_Presentation"."dbo"."D_Beneficiary_Details" "Beneficiary_Details"
                ON "Customer_Details"."SYMEX_Code" = "Beneficiary_Details"."Remitter_Id"
                    LEFT OUTER JOIN "Fawri_Presentation"."dbo"."Country_Details" "Country"
                    ON "Customer_Details"."Nationality_Code" = "Country"."Country_Code"
                        LEFT OUTER JOIN "Fawri_Presentation"."dbo"."D_Profession_LKP" "Profession_Lookup"
                        ON "Customer_Details"."Position_Job_Code" = "Profession_Lookup"."PROF_CODE"
                            LEFT OUTER JOIN "Fawri_Presentation"."dbo"."User_Details" "User_Details_Modified_by"
                            ON "Customer_Details"."Modified_By" = "User_Details_Modified_by"."User_Id"
                                LEFT OUTER JOIN "Fawri_Presentation"."dbo"."User_Details" "User_Details_Created_by"
                                ON "Customer_Details"."Created_By" = "User_Details_Created_by"."User_Id" 
WHERE 
    "ID_Status"."ID_Status" = 1