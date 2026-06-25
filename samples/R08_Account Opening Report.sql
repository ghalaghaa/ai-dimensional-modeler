-- Retail Accounts
------------------
SELECT
    "D1"."C0" AS "Account_Number", 
    "D1"."C1" AS "Account_Suffix", 
    "D1"."C2" AS "Customer_Name", 
    "D1"."C3" AS "Account_Branch", 
    "D1"."C4" AS "Account_Basic_Number", 
    "D1"."C5" AS "Date_Account_Opened", 
    "D1"."C6" AS "Account_Type", 
    "D1"."C7" AS "Created_By", 
    "D1"."C8" AS "Created_By_Name", 
    "D1"."C9" AS "Customer_Type", 
    "D1"."C10" AS "Customer_Branch_Mnemonic", 
    "D1"."C11" AS "Customer_Branch_Finance_Name", 
    "D1"."C12" AS "Program_Code", 
    "D1"."C13" AS "Program_Description"
FROM
    (
    SELECT
        "Account_Details"."Account_Number_External" AS "C0", 
        "Account_Details"."Account_Suffix" AS "C1", 
        "Customer"."Customer_Name" AS "C2", 
        "Account_Details"."Account_Branch" AS "C3", 
        "Account_Details"."Account_Basic_Number_External" AS "C4", 
        "Account_Details"."Date_Account_Opened" AS "C5", 
        "Account_Details"."Account_Type" AS "C6", 
        "Account_Details"."Created_By" AS "C7", 
        CASE 
            WHEN "Account_Details"."Created_By" = 'TEC1' THEN 'Direct by Customer'
            ELSE "Account_Details"."Created_By_Name"
        END AS "C8", 
        "Customer"."Customer_Type" AS "C9", 
        "Customer"."Customer_Branch_Mnemonic" AS "C10", 
        "Customer_Branch_Details"."Branch_Finance_Name" AS "C11", 
        "Program_Code"."Program_Code" AS "C12", 
        "Program_Code"."Program_Description" AS "C13"
    FROM
        "Equation_Presentation"."dbo"."D_Branch" "Branch_Details"
            INNER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details"
            ON "Branch_Details"."Branch_Number" = "Account_Details"."Account_Branch"
                FULL OUTER JOIN 
                "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details"
                    INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
                    ON "Customer_Branch_Details"."Branch_Number" = "Customer"."Customer_Branch_Number"
                ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number"
                    LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Customer_Additional_Detail" "Customer_Additional_Detail"
                    ON "Customer"."Customer_Number" = "Customer_Additional_Detail"."Customer_Number"
                        FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Program_Code" "Program_Code"
                        ON "Program_Code"."Program_Code" = "Customer_Additional_Detail"."Program_Code" 
    WHERE 
        "Account_Details"."Account_Type" IN ( 
            'CA', 
            'CE', 
            'CB', 
            'EA', 
            'EB', 
            'EC' ) AND
        "Account_Details"."Date_Account_Opened" BETWEEN :From_Date: AND :To_Date: AND
        "Branch_Details"."Branch_Code_1" = 'BH104' AND
        "Account_Details"."Account_Branch" <> '0866' AND
        "Account_Details"."Internal_Non_Customer_Account_Flag" = 'N'
    ) "D1" 
GROUP BY 
    "D1"."C0", 
    "D1"."C1", 
    "D1"."C2", 
    "D1"."C3", 
    "D1"."C4", 
    "D1"."C5", 
    "D1"."C6", 
    "D1"."C7", 
    "D1"."C8", 
    "D1"."C9", 
    "D1"."C10", 
    "D1"."C11", 
    "D1"."C12", 
    "D1"."C13"

-- Corporate Accounts
---------------------
SELECT
    "Account_Details"."Account_Number_External" AS "Account_Number", 
    "Account_Details"."Account_Suffix" AS "Account_Suffix", 
    "Customer"."Customer_Name" AS "Customer_Name", 
    "Account_Details"."Account_Branch" AS "Account_Branch", 
    "Account_Details"."Account_Basic_Number_External" AS "Account_Basic_Number", 
    "Account_Details"."Date_Account_Opened" AS "Date_Account_Opened", 
    "Account_Details"."Account_Type" AS "Account_Type", 
    "Account_Details"."Created_By" AS "Created_By", 
    "Account_Details"."Created_By_Name" AS "Created_By_Name", 
    "Customer"."Customer_Type" AS "Customer_Type", 
    "Customer"."Customer_Branch_Mnemonic" AS "Customer_Branch_Mnemonic", 
    "Customer_Branch_Details"."Branch_Finance_Name" AS "Customer_Branch_Finance_Name", 
    "Program_Code"."Program_Description" AS "Program_Description", 
    "Program_Code"."Program_Code" AS "Program_Code"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details"
        INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
        ON "Customer_Branch_Details"."Branch_Number" = "Customer"."Customer_Branch_Number"
            FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details"
            ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number"
                LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Customer_Additional_Detail" "Customer_Additional_Detail"
                ON "Customer"."Customer_Number" = "Customer_Additional_Detail"."Customer_Number"
                    FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Program_Code" "Program_Code"
                    ON "Program_Code"."Program_Code" = "Customer_Additional_Detail"."Program_Code" 
WHERE 
    "Account_Details"."Account_Type" IN ( 
        'CA', 
        'CE', 
        'CB', 
        'EA', 
        'EB', 
        'EC' ) AND
    "Account_Details"."Date_Account_Opened" BETWEEN :From_Date: AND :To_Date: AND
    "Account_Details"."Account_Branch" IN ( 
        '0838', 
        '0840', 
        '0842', 
        '0857', 
        '0858', 
        '0859', 
        '0844', 
        '0837', 
        '0873', 
        '0885', 
        '0886' ) AND
    "Account_Details"."Account_Branch" <> '0866' AND
    "Account_Details"."Account_Branch" IN ( 
        '0838', 
        '0840', 
        '0842' ) 
GROUP BY 
    "Account_Details"."Account_Number_External", 
    "Account_Details"."Account_Suffix", 
    "Customer"."Customer_Name", 
    "Account_Details"."Account_Branch", 
    "Account_Details"."Account_Basic_Number_External", 
    "Account_Details"."Date_Account_Opened", 
    "Account_Details"."Account_Type", 
    "Account_Details"."Created_By", 
    "Account_Details"."Created_By_Name", 
    "Customer"."Customer_Type", 
    "Customer"."Customer_Branch_Mnemonic", 
    "Customer_Branch_Details"."Branch_Finance_Name", 
    "Program_Code"."Program_Description", 
    "Program_Code"."Program_Code"

-- Private Banking Customers
----------------------------
SELECT
    "Account_Details"."Account_Number_External" AS "Account_Number", 
    "Account_Details"."Account_Suffix" AS "Account_Suffix", 
    "Customer"."Customer_Name" AS "Customer_Name", 
    "Account_Details"."Account_Branch" AS "Account_Branch", 
    "Account_Details"."Account_Basic_Number_External" AS "Account_Basic_Number", 
    "Account_Details"."Date_Account_Opened" AS "Date_Account_Opened", 
    "Account_Details"."Account_Type" AS "Account_Type", 
    "Customer"."Customer_Number_External" AS "Customer_Number", 
    "Account_Details"."Created_By" AS "Created_By", 
    "Account_Details"."Created_By_Name" AS "Created_By_Name", 
    "Customer"."Customer_Type" AS "Customer_Type", 
    "Customer"."Customer_Branch_Mnemonic" AS "Customer_Branch_Mnemonic", 
    "Customer_Branch_Details"."Branch_Finance_Name" AS "Customer_Branch_Finance_Name", 
    "Program_Code"."Program_Description" AS "Program_Description", 
    "Program_Code"."Program_Code" AS "Program_Code"
FROM
    "Equation_Presentation"."dbo"."D_Branch" "Customer_Branch_Details"
        INNER JOIN "Equation_Presentation"."dbo"."D_Customer" "Customer"
        ON "Customer_Branch_Details"."Branch_Number" = "Customer"."Customer_Branch_Number"
            FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Account" "Account_Details"
            ON "Account_Details"."Customer_Number" = "Customer"."Customer_Number"
                LEFT OUTER JOIN "Equation_Presentation"."dbo"."D_Customer_Additional_Detail" "Customer_Additional_Detail"
                ON "Customer"."Customer_Number" = "Customer_Additional_Detail"."Customer_Number"
                    FULL OUTER JOIN "Equation_Presentation"."dbo"."D_Program_Code" "Program_Code"
                    ON "Program_Code"."Program_Code" = "Customer_Additional_Detail"."Program_Code" 
WHERE 
    "Account_Details"."Account_Type" IN ( 
        'CA', 
        'CE', 
        'CB', 
        'EA', 
        'EB', 
        'EC' ) AND
    "Account_Details"."Date_Account_Opened" BETWEEN :From_Date: AND :To_Date: AND
    "Account_Details"."Account_Branch" IN ( 
        '0109', 
        '0209', 
        '0309' ) AND
    "Account_Details"."Account_Branch" <> '0866' 
GROUP BY 
    "Account_Details"."Account_Number_External", 
    "Account_Details"."Account_Suffix", 
    "Customer"."Customer_Name", 
    "Account_Details"."Account_Branch", 
    "Account_Details"."Account_Basic_Number_External", 
    "Account_Details"."Date_Account_Opened", 
    "Account_Details"."Account_Type", 
    "Customer"."Customer_Number_External", 
    "Account_Details"."Created_By", 
    "Account_Details"."Created_By_Name", 
    "Customer"."Customer_Type", 
    "Customer"."Customer_Branch_Mnemonic", 
    "Customer_Branch_Details"."Branch_Finance_Name", 
    "Program_Code"."Program_Description", 
    "Program_Code"."Program_Code"
