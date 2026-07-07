SELECT
    "Fawri_Branch"."Code", 
    "Fawri_Branch"."Name"
FROM
    "Fawri_Presentation"."dbo"."D_Branches" "Fawri_Branch"

SELECT
    "Customer_Branch"."Code", 
    "Customer_Branch"."Name"
FROM
    "Fawri_Presentation"."dbo"."D_Branches" "Customer_Branch"

SELECT
    "Fawri_Transactions"."Customer_Id", 
    "Fawri_Transactions"."Entity", 
    CAST("Fawri_Transactions"."Reference_NO" AS VARCHAR(50)), 
    CASE 
        WHEN 
            "Fawri_Transactions"."Beneficiary_First_Name" IS NULL OR
            "Fawri_Transactions"."Beneficiary_Middle_Name" IS NULL OR
            "Fawri_Transactions"."Beneficiary_Last_Name" IS NULL
            THEN
                NULL
        ELSE (((("Fawri_Transactions"."Beneficiary_First_Name" + '  ') + "Fawri_Transactions"."Beneficiary_Middle_Name") + '  ') + "Fawri_Transactions"."Beneficiary_Last_Name")
    END, 
    "Fawri_Transactions"."Product", 
    CASE 
        WHEN "Fawri_Transactions"."Entity" LIKE '6801' THEN 'ATM'
        WHEN "Fawri_Transactions"."Entity" LIKE '6802' THEN 'JOL'
        WHEN "Fawri_Transactions"."Entity" LIKE '6803' THEN 'SMART'
        WHEN "Fawri_Transactions"."Entity" LIKE '6804' THEN 'KISOK'
        WHEN "Fawri_Transactions"."Entity" LIKE '6805' THEN 'Fawri Smart App'
        ELSE 'BRANCH'
    END, 
    "Fawri_Transactions"."Beneficiary_Country", 
    "Beneficiary_Country"."Country_Name", 
    "Fawri_Transactions"."FC_Amount", 
    "Fawri_Transactions"."Amount_In_Base_Currency", 
    "Fawri_Transactions"."Rate", 
    "Fawri_Transactions"."Date", 
    "Fawri_Transactions"."Charges_1_In_Base_Currency", 
    "Fawri_Transactions"."Vat_Amount", 
    "Fawri_Transactions"."Gross_Amount", 
    "Fawri_Transactions"."Document_Reference_No", 
    "Fawri_Transactions"."ATM_ID", 
    "Fawri_Transactions"."Beneficiary_Bank_Name", 
    "Fawri_Transactions"."Foreign_Currency", 
    "ADC_Transactions"."KIOSK_ID", 
    "ADC_Transactions"."POS_Terminal_ID"
FROM
    "Fawri_Presentation"."dbo"."F_Transaction_Details" "Fawri_Transactions"
        LEFT OUTER JOIN "Fawri_Presentation"."dbo"."F_ADC_Transactions_Reference" "ADC_Transactions"
        ON CAST("Fawri_Transactions"."Reference_NO" AS VARCHAR(50)) = "ADC_Transactions"."Transaction_Reference_Number"
            LEFT OUTER JOIN "Fawri_Presentation"."dbo"."Country_Details" "Beneficiary_Country"
            ON "Fawri_Transactions"."Beneficiary_Country" = "Beneficiary_Country"."Country_Code" 
WHERE 
    "Fawri_Transactions"."Date" <= :End_Date: AND
    "Fawri_Transactions"."Date" >= :Start_Date: AND
    CAST("Fawri_Transactions"."Reference_NO" AS VARCHAR(50)) <> ' ' 
ORDER BY 
    "Fawri_Transactions"."Customer_Id" ASC

SELECT
    "Customer_Details"."CIF_Number", 
    "Customer_ID_Details"."ID_Type", 
    "Customer_Details"."SYMEX_Code", 
    CAST("Customer_Details"."Remitter_Entity" AS NVARCHAR(20)), 
    "Customer_Details"."First_Name", 
    "Customer_Details"."Middle_Name", 
    "Customer_Details"."Last_Name", 
    "Customer_Details"."Family_Name", 
    (((((("Customer_Details"."First_Name" + '  ') + "Customer_Details"."Middle_Name") + '  ') + "Customer_Details"."Last_Name") + ' ') + "Customer_Details"."Family_Name"), 
    "Customer_ID_Details"."ID_Number", 
    CASE 
        WHEN "Customer_Details"."Blocked" = 1 THEN 'BLOCKED'
        WHEN "Customer_Details"."Remitter_Status" = 0 THEN 'OPEN'
        WHEN "Customer_Details"."Remitter_Status" = 1 THEN 'APPROVED'
        WHEN "Customer_Details"."Remitter_Status" = 2 THEN 'REJECTED'
    END
FROM
    "Fawri_Presentation"."dbo"."Customer_Details" "Customer_Details"
        INNER JOIN "Fawri_Presentation"."dbo"."Customer_ID_Details" "Customer_ID_Details"
        ON "Customer_Details"."SYMEX_Code" = "Customer_ID_Details"."SYMEX_Code"

SELECT
    "D_Account"."Account_Basic_Number_External", 
    "D_Account"."Account_Number_External", 
    "D_Account"."Account_Type", 
    "D_Account"."Balance_Last_Business_Day", 
    "D_Account"."Date_Account_Closed", 
    "D_Account"."Dormant_Flag", 
    "D_Account"."Abandoned_Inactivity", 
    "D_Account"."Unclaimed_Less_Than_100SAR", 
    "D_Account"."Special_Condition_SC090", 
    "D_Account"."Special_Condition_SC091", 
    "D_Account"."Account_Status_Blocked", 
    "D_Account"."Account_Branch"
FROM
    "Equation_Presentation"."dbo"."D_Account" "D_Account"

SELECT
    "ID_Status"."ID_Code", 
    "ID_Status"."ID_Status"
FROM
    "Fawri_Presentation"."dbo"."Customer_ID_Status" "ID_Status"

SELECT
    "D_Cortex_Account"."Account_Number", 
    "D_Cortex_Account"."ID", 
    "D_Cortex_Account"."CustomerDet_ID"
FROM
    "ATM_Presentation"."dbo"."D_Cortex_Account" "D_Cortex_Account"

SELECT
    "D_Cortex_Card_Details"."Account_ID", 
    "D_Cortex_Card_Details"."Customer_ID", 
    "D_Cortex_Card_Details"."PAN_Display", 
    "D_Cortex_Card_Details"."Card_Status_Description"
FROM
    "ATM_Presentation"."dbo"."D_Cortex_Card_Details" "D_Cortex_Card_Details"