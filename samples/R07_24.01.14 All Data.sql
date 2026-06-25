SELECT DISTINCT 
    "TQ0_Account"."Account_Basic_Number" AS "Account_Basic_Number", 
    MAX("TQ0_Account"."Date_Last_Customer_Entry")
        OVER(
            PARTITION BY
                "TQ0_Account"."Account_Basic_Number"
        ) AS "Date_Last_Customer_Entry"
FROM
    (
    SELECT
        "Account_Details_UD"."Account_Basic_Number_External" AS "Account_Basic_Number", 
        MAX("Account_Details_UD"."Date_Last_Customer_Entry")
            OVER(
                PARTITION BY
                    "Account_Details_UD"."Account_Basic_Number_External"
            ) AS "Max1", 
        "Account_Details_UD"."Date_Last_Customer_Entry" AS "Date_Last_Customer_Entry"
    FROM
        "Finance_MIS"."dbo"."D_Account_Details_UD" "Account_Details_UD"
    ) "TQ0_Account" 
WHERE 
    "TQ0_Account"."Date_Last_Customer_Entry" = "TQ0_Account"."Max1"

SELECT
    "Branch_Details_UD"."Branch_Level_4", 
    (("Branch_Details_UD"."Branch_Number" + '-') + "Branch_Details_UD"."Branch_Name"), 
    "Customer_Details_Month_End"."Customer_Number_External", 
    replace(replace("Customer_Details_Month_End"."Customer_Name", char(13), ' '), char(10), ' '), 
    "Customer_Details_Month_End"."Customer_Type", 
    "Customer_Details_Month_End"."Customer_Entry_Date", 
    "Finance_MIS"."dbo"."Customer_Age"("Customer_Additional_Detail2_RBG"."Customer_Birth_Date"), 
    "Customer_Additional_Detail2_RBG"."Cust_Address_City", 
    "Customer_Additional_Detail2_RBG"."Cust_Address_P_O_Box", 
    replace(replace("Customer_Additional_Detail2_RBG"."Mobile_Number", char(13), ' '), char(10), ' '), 
    "Customer_Additional_Detail2_RBG"."Land_line_Number", 
    SUBSTRING("Customer_Details_Month_End"."Customer_Reference", 3, 10), 
    "Customer_Program_Details_Month_End"."Relationship_Officer_ID", 
    "Relationship_Details"."Relationship_Name", 
    "Customer_Additional_Detail2_RBG"."Gender", 
    "Cust_Month_End_Flag_Details"."Program_Assignment_Date", 
    DATEDIFF(DAY, "Customer_Details_Month_End"."Customer_Entry_Date", "Cust_Month_End_Flag_Details"."Program_Assignment_Date"), 
    "Customer_Additional_Detail2_RBG"."Nationality", 
    "Cust_Month_End_Flag_Details"."Cust_ATM_Flag", 
    "Cust_Month_End_Flag_Details"."Cust_IVR_Flag", 
    "Cust_Month_End_Flag_Details"."Cust_Online_Flag", 
    CASE 
        WHEN "Cust_Month_End_Flag_Details"."No_Of_Credit_Card" = 0 THEN 'N'
        ELSE 'Y'
    END, 
    "Cust_Month_End_Flag_Details"."No_Of_Credit_Card", 
    ROUND(CAST("Cust_Month_End_Flag_Details"."CC_Outstanding_Balance" AS DOUBLE PRECISION) / 100, 0), 
    "Cust_Month_End_Flag_Details"."Sales_Program_Code_1", 
    "Segment_Arabic_Details"."Segment_Description", 
    CASE 
        WHEN 
            "Cust_Month_End_Flag_Details"."Payroll_Flag" IS NULL OR
            "Cust_Month_End_Flag_Details"."Payroll_Flag" = ' '
            THEN
                'N'
        ELSE "Cust_Month_End_Flag_Details"."Payroll_Flag"
    END, 
    "Payroll_Max3_Details"."First_Payroll_Date", 
    ROUND(CAST("Payroll_Max3_Details"."Payroll_Amount_PM" AS DOUBLE PRECISION) / 100, 0), 
    ROUND(CAST("Payroll_Max3_Details"."Payroll_Amount_PM_1" AS DOUBLE PRECISION) / 100, 0), 
    ROUND(CAST("Payroll_Max3_Details"."Payroll_Amount_PM_2" AS DOUBLE PRECISION) / 100, 0), 
    "Final_Customer_Status_Upgrade"."Below_Criteria", 
    "Final_Customer_Status_Upgrade"."Below_Criteria_AJC", 
    "Final_Customer_Status_Upgrade"."To_Be_Down_Graded", 
    "Final_Customer_Status_Upgrade"."To_Be_Down_Graded_AJC", 
    "Final_Customer_Status_Upgrade"."To_Be_Upgraded", 
    "Final_Customer_Status_Upgrade"."Potential_3_months", 
    "Final_Customer_Status_Upgrade"."Cross_Sell", 
    CASE 
        WHEN "Takaful_Details"."Grand_Total" = 2 THEN "Final_Customer_Status_Upgrade"."Cross_Sell" - 1
        WHEN "Takaful_Details"."Grand_Total" = 3 THEN "Final_Customer_Status_Upgrade"."Cross_Sell" - 2
        WHEN "Takaful_Details"."Grand_Total" = 4 THEN "Final_Customer_Status_Upgrade"."Cross_Sell" - 3
        WHEN "Takaful_Details"."Grand_Total" = 5 THEN "Final_Customer_Status_Upgrade"."Cross_Sell" - 4
        WHEN "Takaful_Details"."Grand_Total" = 6 THEN "Final_Customer_Status_Upgrade"."Cross_Sell" - 5
        ELSE "Final_Customer_Status_Upgrade"."Cross_Sell"
    END, 
    CASE 
        WHEN 
            DATEDIFF(DAY, "Customer_Details_Month_End"."Customer_Entry_Date", "Cust_Month_End_Flag_Details"."Program_Assignment_Date") <= 120 AND
            DATEPART(MONTH, "Cust_Month_End_Flag_Details"."Program_Assignment_Date") = DATEPART(MONTH, DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE)))))) AND
            DATEPART(YEAR, "Cust_Month_End_Flag_Details"."Program_Assignment_Date") = DATEPART(YEAR, DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))))
            THEN
                'Y'
        ELSE 'N'
    END, 
    CASE 
        WHEN "Final_Customer_Status_Upgrade"."Final_Customer_Status" IS NULL THEN "Customer_Up_Down_Flag"."PC_Deposits"
        ELSE "Final_Customer_Status_Upgrade"."Final_Customer_Status"
    END, 
    CAST(CURRENT_TIMESTAMP AS DATE), 
    CASE 
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_4" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_5" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_6" = 'Y'
            THEN
                6
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_4" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_5" = 'Y'
            THEN
                5
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_4" = 'Y'
            THEN
                4
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y'
            THEN
                3
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y'
            THEN
                2
        WHEN "Below_Criteria_6_Months"."BC_PM_1" = 'Y' THEN 1
        ELSE 0
    END, 
    DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))), 
    CASE 
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_4" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_5" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_6" = 'Y'
            THEN
                6
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_4" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_5" = 'Y'
            THEN
                5
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_4" = 'Y'
            THEN
                4
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_3" = 'Y'
            THEN
                3
        WHEN 
            "Below_Criteria_6_Months"."BC_PM_1" = 'Y' AND
            "Below_Criteria_6_Months"."BC_PM_2" = 'Y'
            THEN
                2
        WHEN "Below_Criteria_6_Months"."BC_PM_1" = 'Y' THEN 1
        ELSE 0
    END - 1, 
    "UpGrade_DownGrade_RBG"."Count_Pure_NIBS", 
    ROUND("UpGrade_DownGrade_RBG"."Pure_NIBS_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Three_months_Pure_NIBS_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Six_months_Pure_NIBS_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_NIBS", 
    ROUND("UpGrade_DownGrade_RBG"."NIBS_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Three_months_NIBS_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Six_months_NIBS_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_NAQA", 
    ROUND("UpGrade_DownGrade_RBG"."NAQA_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Three_Months_NAQA_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Six_Months_NAQA_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_Shares", 
    ROUND("UpGrade_DownGrade_RBG"."Shares_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Three_Months_Shares_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Six_Months_Shares_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_Dinar", 
    ROUND("UpGrade_DownGrade_RBG"."Dinar_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_Real_Estate", 
    ROUND("UpGrade_DownGrade_RBG"."Real_Estate_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_RE_Financing", 
    ROUND("UpGrade_DownGrade_RBG"."RE_Financing_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_RE_Ijara", 
    ROUND("UpGrade_DownGrade_RBG"."RE_Ijara_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_RE_Investment", 
    ROUND("UpGrade_DownGrade_RBG"."RE_Investment_Last_Business_Day_Balance", 0), 
    ROUND("UpGrade_DownGrade_RBG"."RE_Investment_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_RE_Mortgage", 
    ROUND("UpGrade_DownGrade_RBG"."RE_Mortgage_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_RE_Secured_Facility", 
    ROUND("UpGrade_DownGrade_RBG"."RE_Secured_Facility_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_RE_Secured_Lending", 
    ROUND("UpGrade_DownGrade_RBG"."RE_Secured_Lending_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_SL_Mortgage", 
    ROUND("UpGrade_DownGrade_RBG"."SL_Mortgage_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_SL_Deposits", 
    ROUND("UpGrade_DownGrade_RBG"."SL_Deposits_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_SL_Shares", 
    ROUND("UpGrade_DownGrade_RBG"."SL_Shares_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_Tamam", 
    ROUND("UpGrade_DownGrade_RBG"."Tamam_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_Cash_Margin", 
    ROUND("UpGrade_DownGrade_RBG"."Cash_Margin_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Three_Months_Cash_Margin_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Six_Months_Cash_Margin_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_Mutual_Fund", 
    ROUND("UpGrade_DownGrade_RBG"."Mutual_Fund_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Three_Months_Mutual_Fund_AVG", 0), 
    ROUND("UpGrade_DownGrade_RBG"."Six_Months_Mutual_Fund_AVG", 0), 
    "UpGrade_DownGrade_RBG"."Count_SL_INV", 
    ROUND("UpGrade_DownGrade_RBG"."SL_INV_Last_Business_Day_Balance", 0), 
    ROUND("UpGrade_DownGrade_RBG"."SL_INV_AVG", 0)
FROM
    "Finance_MIS"."dbo"."D_Below_Criteria_6_Months" "Below_Criteria_6_Months"
        INNER JOIN 
        (
        SELECT
            "F_UpGrade_DownGrade_RBG"."Customer_number" AS "Customer_number", 
            "F_UpGrade_DownGrade_RBG"."Count_Pure_NIBS" AS "Count_Pure_NIBS", 
            "F_UpGrade_DownGrade_RBG"."Pure_NIBS_AVG" AS "Pure_NIBS_AVG", 
            "F_UpGrade_DownGrade_RBG"."Three_months_Pure_NIBS_AVG" AS "Three_months_Pure_NIBS_AVG", 
            "F_UpGrade_DownGrade_RBG"."Six_months_Pure_NIBS_AVG" AS "Six_months_Pure_NIBS_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_NIBS" AS "Count_NIBS", 
            "F_UpGrade_DownGrade_RBG"."NIBS_AVG" AS "NIBS_AVG", 
            "F_UpGrade_DownGrade_RBG"."Three_months_NIBS_AVG" AS "Three_months_NIBS_AVG", 
            "F_UpGrade_DownGrade_RBG"."Six_months_NIBS_AVG" AS "Six_months_NIBS_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_NAQA" AS "Count_NAQA", 
            "F_UpGrade_DownGrade_RBG"."NAQA_AVG" AS "NAQA_AVG", 
            "F_UpGrade_DownGrade_RBG"."Three_Months_NAQA_AVG" AS "Three_Months_NAQA_AVG", 
            "F_UpGrade_DownGrade_RBG"."Six_Months_NAQA_AVG" AS "Six_Months_NAQA_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_Shares" AS "Count_Shares", 
            "F_UpGrade_DownGrade_RBG"."Shares_AVG" AS "Shares_AVG", 
            "F_UpGrade_DownGrade_RBG"."Three_Months_Shares_AVG" AS "Three_Months_Shares_AVG", 
            "F_UpGrade_DownGrade_RBG"."Six_Months_Shares_AVG" AS "Six_Months_Shares_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_Dinar" AS "Count_Dinar", 
            "F_UpGrade_DownGrade_RBG"."Dinar_AVG" AS "Dinar_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_Real_Estate" AS "Count_Real_Estate", 
            "F_UpGrade_DownGrade_RBG"."Real_Estate_AVG" AS "Real_Estate_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_RE_Financing" AS "Count_RE_Financing", 
            "F_UpGrade_DownGrade_RBG"."RE_Financing_AVG" AS "RE_Financing_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_RE_Ijara" AS "Count_RE_Ijara", 
            "F_UpGrade_DownGrade_RBG"."RE_Ijara_AVG" AS "RE_Ijara_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_RE_Investment" AS "Count_RE_Investment", 
            "F_UpGrade_DownGrade_RBG"."RE_Investment_Last_Business_Day_Balance" AS "RE_Investment_Last_Business_Day_Balance", 
            "F_UpGrade_DownGrade_RBG"."RE_Investment_AVG" AS "RE_Investment_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_RE_Mortgage" AS "Count_RE_Mortgage", 
            "F_UpGrade_DownGrade_RBG"."RE_Mortgage_AVG" AS "RE_Mortgage_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_RE_Secured_Facility" AS "Count_RE_Secured_Facility", 
            "F_UpGrade_DownGrade_RBG"."RE_Secured_Facility_AVG" AS "RE_Secured_Facility_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_RE_Secured_Lending" AS "Count_RE_Secured_Lending", 
            "F_UpGrade_DownGrade_RBG"."RE_Secured_Lending_AVG" AS "RE_Secured_Lending_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_SL_Mortgage" AS "Count_SL_Mortgage", 
            "F_UpGrade_DownGrade_RBG"."SL_Mortgage_AVG" AS "SL_Mortgage_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_SL_Deposits" AS "Count_SL_Deposits", 
            "F_UpGrade_DownGrade_RBG"."SL_Deposits_AVG" AS "SL_Deposits_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_SL_Shares" AS "Count_SL_Shares", 
            "F_UpGrade_DownGrade_RBG"."SL_Shares_AVG" AS "SL_Shares_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_Tamam" AS "Count_Tamam", 
            "F_UpGrade_DownGrade_RBG"."Tamam_AVG" AS "Tamam_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_Cash_Margin" AS "Count_Cash_Margin", 
            "F_UpGrade_DownGrade_RBG"."Cash_Margin_AVG" AS "Cash_Margin_AVG", 
            "F_UpGrade_DownGrade_RBG"."Three_Months_Cash_Margin_AVG" AS "Three_Months_Cash_Margin_AVG", 
            "F_UpGrade_DownGrade_RBG"."Six_Months_Cash_Margin_AVG" AS "Six_Months_Cash_Margin_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_Mutual_Fund" AS "Count_Mutual_Fund", 
            "F_UpGrade_DownGrade_RBG"."Mutual_Fund_AVG" AS "Mutual_Fund_AVG", 
            "F_UpGrade_DownGrade_RBG"."Three_Months_Mutual_Fund_AVG" AS "Three_Months_Mutual_Fund_AVG", 
            "F_UpGrade_DownGrade_RBG"."Six_Months_Mutual_Fund_AVG" AS "Six_Months_Mutual_Fund_AVG", 
            "F_UpGrade_DownGrade_RBG"."Count_SL_INV" AS "Count_SL_INV", 
            "F_UpGrade_DownGrade_RBG"."SL_INV_Last_Business_Day_Balance" AS "SL_INV_Last_Business_Day_Balance", 
            "F_UpGrade_DownGrade_RBG"."SL_INV_AVG" AS "SL_INV_AVG", 
            "F_UpGrade_DownGrade_RBG"."End_Of_Month_Date" AS "End_Of_Month_Date"
        FROM
            "Finance_MIS"."dbo"."F_UpGrade_DownGrade_RBG" "F_UpGrade_DownGrade_RBG" 
        WHERE 
            "F_UpGrade_DownGrade_RBG"."Customer_number" <> 'SADEEM'
        ) "UpGrade_DownGrade_RBG"
        ON "Below_Criteria_6_Months"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
            INNER JOIN 
            (
            SELECT
                "D_Customer_Additional_Detail2_RBG"."Cust_Address_City" AS "Cust_Address_City", 
                "D_Customer_Additional_Detail2_RBG"."Cust_Address_P_O_Box" AS "Cust_Address_P_O_Box", 
                "D_Customer_Additional_Detail2_RBG"."Land_line_Number" AS "Land_line_Number", 
                "D_Customer_Additional_Detail2_RBG"."Gender" AS "Gender", 
                "D_Customer_Additional_Detail2_RBG"."Nationality" AS "Nationality", 
                "D_Customer_Additional_Detail2_RBG"."Customer_Number" AS "Customer_Number", 
                "D_Customer_Additional_Detail2_RBG"."Customer_Birth_Date" AS "Customer_Birth_Date", 
                "D_Customer_Additional_Detail2_RBG"."Mobile_Number" AS "Mobile_Number"
            FROM
                "Finance_MIS"."dbo"."D_Customer_Additional_Detail2_RBG" "D_Customer_Additional_Detail2_RBG" 
            WHERE 
                "D_Customer_Additional_Detail2_RBG"."Customer_Number" <> 'SADEEM'
            ) "Customer_Additional_Detail2_RBG"
            ON "Customer_Additional_Detail2_RBG"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                INNER JOIN 
                (
                SELECT
                    "D_Customer_Details_Month_End"."Customer_Number_External" AS "Customer_Number_External", 
                    "D_Customer_Details_Month_End"."Customer_Type" AS "Customer_Type", 
                    "D_Customer_Details_Month_End"."Customer_Entry_Date" AS "Customer_Entry_Date", 
                    "D_Customer_Details_Month_End"."Customer_Number" AS "Customer_Number", 
                    "D_Customer_Details_Month_End"."Customer_Name" AS "Customer_Name", 
                    "D_Customer_Details_Month_End"."Customer_Reference" AS "Customer_Reference", 
                    "D_Customer_Details_Month_End"."Customer_Branch_Number" AS "Customer_Branch_Number"
                FROM
                    "Finance_MIS"."dbo"."D_Customer_Details_Month_End" "D_Customer_Details_Month_End" 
                WHERE 
                    "D_Customer_Details_Month_End"."Customer_Number" <> 'SADEEM'
                ) "Customer_Details_Month_End"
                ON "Customer_Details_Month_End"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                    INNER JOIN 
                    (
                    SELECT
                        "D_Customer_Up_Down_Flag"."Customer_number" AS "Customer_number", 
                        "D_Customer_Up_Down_Flag"."PC_Deposits" AS "PC_Deposits", 
                        "D_Customer_Up_Down_Flag"."End_Of_Month_Date" AS "End_Of_Month_Date"
                    FROM
                        "Finance_MIS"."dbo"."D_Customer_Up_Down_Flag" "D_Customer_Up_Down_Flag" 
                    WHERE 
                        "D_Customer_Up_Down_Flag"."Customer_number" <> 'SADEEM'
                    ) "Customer_Up_Down_Flag"
                    ON 
                        "Customer_Up_Down_Flag"."Customer_number" = "UpGrade_DownGrade_RBG"."Customer_number" AND
                        "Customer_Up_Down_Flag"."End_Of_Month_Date" = "UpGrade_DownGrade_RBG"."End_Of_Month_Date"
                        INNER JOIN 
                        (
                        SELECT
                            "D_Final_Customer_Status_Upgrade"."Below_Criteria" AS "Below_Criteria", 
                            "D_Final_Customer_Status_Upgrade"."Below_Criteria_AJC" AS "Below_Criteria_AJC", 
                            "D_Final_Customer_Status_Upgrade"."To_Be_Down_Graded" AS "To_Be_Down_Graded", 
                            "D_Final_Customer_Status_Upgrade"."To_Be_Down_Graded_AJC" AS "To_Be_Down_Graded_AJC", 
                            "D_Final_Customer_Status_Upgrade"."To_Be_Upgraded" AS "To_Be_Upgraded", 
                            "D_Final_Customer_Status_Upgrade"."Potential_3_months" AS "Potential_3_months", 
                            "D_Final_Customer_Status_Upgrade"."Cross_Sell" AS "Cross_Sell", 
                            "D_Final_Customer_Status_Upgrade"."Customer_number" AS "Customer_number", 
                            "D_Final_Customer_Status_Upgrade"."Final_Customer_Status" AS "Final_Customer_Status", 
                            "D_Final_Customer_Status_Upgrade"."End_Of_Month_Date" AS "End_Of_Month_Date"
                        FROM
                            "Finance_MIS"."dbo"."D_Final_Customer_Status_Upgrade" "D_Final_Customer_Status_Upgrade" 
                        WHERE 
                            "D_Final_Customer_Status_Upgrade"."Customer_number" <> 'SADEEM'
                        ) "Final_Customer_Status_Upgrade"
                        ON 
                            "UpGrade_DownGrade_RBG"."Customer_number" = "Final_Customer_Status_Upgrade"."Customer_number" AND
                            "UpGrade_DownGrade_RBG"."End_Of_Month_Date" = "Final_Customer_Status_Upgrade"."End_Of_Month_Date"
                            LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Branch_Details_UD" "Branch_Details_UD"
                            ON "Branch_Details_UD"."Branch_Number" = "Customer_Details_Month_End"."Customer_Branch_Number"
                                LEFT OUTER JOIN 
                                (
                                SELECT
                                    "D_Cust_Month_End_Flag_Details"."Program_Assignment_Date" AS "Program_Assignment_Date", 
                                    "D_Cust_Month_End_Flag_Details"."Cust_ATM_Flag" AS "Cust_ATM_Flag", 
                                    "D_Cust_Month_End_Flag_Details"."Cust_IVR_Flag" AS "Cust_IVR_Flag", 
                                    "D_Cust_Month_End_Flag_Details"."Cust_Online_Flag" AS "Cust_Online_Flag", 
                                    "D_Cust_Month_End_Flag_Details"."No_Of_Credit_Card" AS "No_Of_Credit_Card", 
                                    "D_Cust_Month_End_Flag_Details"."Sales_Program_Code_1" AS "Sales_Program_Code_1", 
                                    "D_Cust_Month_End_Flag_Details"."Customer_Number" AS "Customer_Number", 
                                    "D_Cust_Month_End_Flag_Details"."Customer_Closed_Flag" AS "Customer_Closed_Flag", 
                                    "D_Cust_Month_End_Flag_Details"."Payroll_Flag" AS "Payroll_Flag", 
                                    "D_Cust_Month_End_Flag_Details"."CC_Outstanding_Balance" AS "CC_Outstanding_Balance", 
                                    "D_Cust_Month_End_Flag_Details"."End_Of_Month_Date" AS "End_Of_Month_Date"
                                FROM
                                    "Finance_MIS"."dbo"."D_Cust_Month_End_Flag_Details" "D_Cust_Month_End_Flag_Details" 
                                WHERE 
                                    "D_Cust_Month_End_Flag_Details"."Customer_Number" <> 'SADEEM'
                                ) "Cust_Month_End_Flag_Details"
                                ON 
                                    "Cust_Month_End_Flag_Details"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number" AND
                                    "Cust_Month_End_Flag_Details"."End_Of_Month_Date" = "UpGrade_DownGrade_RBG"."End_Of_Month_Date"
                                    LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Segment_Arabic_Details" "Segment_Arabic_Details"
                                    ON "Segment_Arabic_Details"."Segment_Code" = "Cust_Month_End_Flag_Details"."Sales_Program_Code_1"
                                        LEFT OUTER JOIN 
                                        (
                                        SELECT
                                            "D_Customer_Program_Details_Month_End"."Relationship_Officer_ID" AS "Relationship_Officer_ID", 
                                            "D_Customer_Program_Details_Month_End"."Customer_Number" AS "Customer_Number"
                                        FROM
                                            "Finance_MIS"."dbo"."D_Customer_Program_Details_Month_End" "D_Customer_Program_Details_Month_End" 
                                        WHERE 
                                            "D_Customer_Program_Details_Month_End"."Customer_Number" <> 'SADEEM'
                                        ) "Customer_Program_Details_Month_End"
                                        ON "Customer_Program_Details_Month_End"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                                            LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Relationship_Details" "Relationship_Details"
                                            ON "Relationship_Details"."Relationship_Number" = "Customer_Program_Details_Month_End"."Relationship_Officer_ID"
                                                LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Payroll_Max3_Details" "Payroll_Max3_Details"
                                                ON "Payroll_Max3_Details"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                                                    LEFT OUTER JOIN "Finance_MIS"."dbo"."D_RBG_Customers_UD" "RBG_Customers_UD"
                                                    ON "RBG_Customers_UD"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                                                        LEFT OUTER JOIN "Finance_MIS"."dbo"."D_Takaful_Details" "Takaful_Details"
                                                        ON "UpGrade_DownGrade_RBG"."Customer_number" = "Takaful_Details"."Customer_Number" 
WHERE 
    "UpGrade_DownGrade_RBG"."End_Of_Month_Date" = CAST(DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))) as DATETIME) AND
    (CASE 
        WHEN "RBG_Customers_UD"."Customer_Number" <> ' ' THEN 'Y'
        ELSE 'N'
    END = 'Y' OR
    "Customer_Details_Month_End"."Customer_Number_External" <= 750000 OR
    "Customer_Details_Month_End"."Customer_Number_External" > 999999) AND
    "Cust_Month_End_Flag_Details"."Customer_Closed_Flag" = 'N' AND
    NOT ( "Branch_Details_UD"."Branch_Number" IN ( 
        '0820', 
        '0873' ) )

SELECT
    "PM_Segment"."Customer_Number", 
    DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -1, CAST(CURRENT_TIMESTAMP AS DATE))))), 
    "PM_Segment"."PM_Segment"
FROM
    (
    SELECT
        "Customer_Details_Month_End"."Customer_Number_External" AS "Customer_Number", 
        "Cust_Month_End_Flag_Details"."Sales_Program_Code_1" AS "PM_Segment"
    FROM
        (
        SELECT
            "D_Customer_Details_Month_End"."Customer_Number_External" AS "Customer_Number_External", 
            "D_Customer_Details_Month_End"."Customer_Type" AS "Customer_Type", 
            "D_Customer_Details_Month_End"."Customer_Entry_Date" AS "Customer_Entry_Date", 
            "D_Customer_Details_Month_End"."Customer_Number" AS "Customer_Number", 
            "D_Customer_Details_Month_End"."Customer_Name" AS "Customer_Name", 
            "D_Customer_Details_Month_End"."Customer_Reference" AS "Customer_Reference", 
            "D_Customer_Details_Month_End"."Customer_Branch_Number" AS "Customer_Branch_Number"
        FROM
            "Finance_MIS"."dbo"."D_Customer_Details_Month_End" "D_Customer_Details_Month_End" 
        WHERE 
            "D_Customer_Details_Month_End"."Customer_Number" <> 'SADEEM'
        ) "Customer_Details_Month_End"
            INNER JOIN 
            (
            SELECT
                "F_UpGrade_DownGrade_RBG"."Customer_number" AS "Customer_number", 
                "F_UpGrade_DownGrade_RBG"."Count_Pure_NIBS" AS "Count_Pure_NIBS", 
                "F_UpGrade_DownGrade_RBG"."Pure_NIBS_AVG" AS "Pure_NIBS_AVG", 
                "F_UpGrade_DownGrade_RBG"."Three_months_Pure_NIBS_AVG" AS "Three_months_Pure_NIBS_AVG", 
                "F_UpGrade_DownGrade_RBG"."Six_months_Pure_NIBS_AVG" AS "Six_months_Pure_NIBS_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_NIBS" AS "Count_NIBS", 
                "F_UpGrade_DownGrade_RBG"."NIBS_AVG" AS "NIBS_AVG", 
                "F_UpGrade_DownGrade_RBG"."Three_months_NIBS_AVG" AS "Three_months_NIBS_AVG", 
                "F_UpGrade_DownGrade_RBG"."Six_months_NIBS_AVG" AS "Six_months_NIBS_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_NAQA" AS "Count_NAQA", 
                "F_UpGrade_DownGrade_RBG"."NAQA_AVG" AS "NAQA_AVG", 
                "F_UpGrade_DownGrade_RBG"."Three_Months_NAQA_AVG" AS "Three_Months_NAQA_AVG", 
                "F_UpGrade_DownGrade_RBG"."Six_Months_NAQA_AVG" AS "Six_Months_NAQA_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_Shares" AS "Count_Shares", 
                "F_UpGrade_DownGrade_RBG"."Shares_AVG" AS "Shares_AVG", 
                "F_UpGrade_DownGrade_RBG"."Three_Months_Shares_AVG" AS "Three_Months_Shares_AVG", 
                "F_UpGrade_DownGrade_RBG"."Six_Months_Shares_AVG" AS "Six_Months_Shares_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_Dinar" AS "Count_Dinar", 
                "F_UpGrade_DownGrade_RBG"."Dinar_AVG" AS "Dinar_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_Real_Estate" AS "Count_Real_Estate", 
                "F_UpGrade_DownGrade_RBG"."Real_Estate_AVG" AS "Real_Estate_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_RE_Financing" AS "Count_RE_Financing", 
                "F_UpGrade_DownGrade_RBG"."RE_Financing_AVG" AS "RE_Financing_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_RE_Ijara" AS "Count_RE_Ijara", 
                "F_UpGrade_DownGrade_RBG"."RE_Ijara_AVG" AS "RE_Ijara_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_RE_Investment" AS "Count_RE_Investment", 
                "F_UpGrade_DownGrade_RBG"."RE_Investment_Last_Business_Day_Balance" AS "RE_Investment_Last_Business_Day_Balance", 
                "F_UpGrade_DownGrade_RBG"."RE_Investment_AVG" AS "RE_Investment_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_RE_Mortgage" AS "Count_RE_Mortgage", 
                "F_UpGrade_DownGrade_RBG"."RE_Mortgage_AVG" AS "RE_Mortgage_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_RE_Secured_Facility" AS "Count_RE_Secured_Facility", 
                "F_UpGrade_DownGrade_RBG"."RE_Secured_Facility_AVG" AS "RE_Secured_Facility_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_RE_Secured_Lending" AS "Count_RE_Secured_Lending", 
                "F_UpGrade_DownGrade_RBG"."RE_Secured_Lending_AVG" AS "RE_Secured_Lending_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_SL_Mortgage" AS "Count_SL_Mortgage", 
                "F_UpGrade_DownGrade_RBG"."SL_Mortgage_AVG" AS "SL_Mortgage_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_SL_Deposits" AS "Count_SL_Deposits", 
                "F_UpGrade_DownGrade_RBG"."SL_Deposits_AVG" AS "SL_Deposits_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_SL_Shares" AS "Count_SL_Shares", 
                "F_UpGrade_DownGrade_RBG"."SL_Shares_AVG" AS "SL_Shares_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_Tamam" AS "Count_Tamam", 
                "F_UpGrade_DownGrade_RBG"."Tamam_AVG" AS "Tamam_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_Cash_Margin" AS "Count_Cash_Margin", 
                "F_UpGrade_DownGrade_RBG"."Cash_Margin_AVG" AS "Cash_Margin_AVG", 
                "F_UpGrade_DownGrade_RBG"."Three_Months_Cash_Margin_AVG" AS "Three_Months_Cash_Margin_AVG", 
                "F_UpGrade_DownGrade_RBG"."Six_Months_Cash_Margin_AVG" AS "Six_Months_Cash_Margin_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_Mutual_Fund" AS "Count_Mutual_Fund", 
                "F_UpGrade_DownGrade_RBG"."Mutual_Fund_AVG" AS "Mutual_Fund_AVG", 
                "F_UpGrade_DownGrade_RBG"."Three_Months_Mutual_Fund_AVG" AS "Three_Months_Mutual_Fund_AVG", 
                "F_UpGrade_DownGrade_RBG"."Six_Months_Mutual_Fund_AVG" AS "Six_Months_Mutual_Fund_AVG", 
                "F_UpGrade_DownGrade_RBG"."Count_SL_INV" AS "Count_SL_INV", 
                "F_UpGrade_DownGrade_RBG"."SL_INV_Last_Business_Day_Balance" AS "SL_INV_Last_Business_Day_Balance", 
                "F_UpGrade_DownGrade_RBG"."SL_INV_AVG" AS "SL_INV_AVG", 
                "F_UpGrade_DownGrade_RBG"."End_Of_Month_Date" AS "End_Of_Month_Date"
            FROM
                "Finance_MIS"."dbo"."F_UpGrade_DownGrade_RBG" "F_UpGrade_DownGrade_RBG" 
            WHERE 
                "F_UpGrade_DownGrade_RBG"."Customer_number" <> 'SADEEM'
            ) "UpGrade_DownGrade_RBG"
            ON "Customer_Details_Month_End"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number"
                LEFT OUTER JOIN 
                (
                SELECT
                    "D_Cust_Month_End_Flag_Details"."Program_Assignment_Date" AS "Program_Assignment_Date", 
                    "D_Cust_Month_End_Flag_Details"."Cust_ATM_Flag" AS "Cust_ATM_Flag", 
                    "D_Cust_Month_End_Flag_Details"."Cust_IVR_Flag" AS "Cust_IVR_Flag", 
                    "D_Cust_Month_End_Flag_Details"."Cust_Online_Flag" AS "Cust_Online_Flag", 
                    "D_Cust_Month_End_Flag_Details"."No_Of_Credit_Card" AS "No_Of_Credit_Card", 
                    "D_Cust_Month_End_Flag_Details"."Sales_Program_Code_1" AS "Sales_Program_Code_1", 
                    "D_Cust_Month_End_Flag_Details"."Customer_Number" AS "Customer_Number", 
                    "D_Cust_Month_End_Flag_Details"."Customer_Closed_Flag" AS "Customer_Closed_Flag", 
                    "D_Cust_Month_End_Flag_Details"."Payroll_Flag" AS "Payroll_Flag", 
                    "D_Cust_Month_End_Flag_Details"."CC_Outstanding_Balance" AS "CC_Outstanding_Balance", 
                    "D_Cust_Month_End_Flag_Details"."End_Of_Month_Date" AS "End_Of_Month_Date"
                FROM
                    "Finance_MIS"."dbo"."D_Cust_Month_End_Flag_Details" "D_Cust_Month_End_Flag_Details" 
                WHERE 
                    "D_Cust_Month_End_Flag_Details"."Customer_Number" <> 'SADEEM'
                ) "Cust_Month_End_Flag_Details"
                ON 
                    "Cust_Month_End_Flag_Details"."Customer_Number" = "UpGrade_DownGrade_RBG"."Customer_number" AND
                    "Cust_Month_End_Flag_Details"."End_Of_Month_Date" = "UpGrade_DownGrade_RBG"."End_Of_Month_Date" 
    WHERE 
        "Cust_Month_End_Flag_Details"."End_Of_Month_Date" = CAST(DATEADD(DAY, -1, DATEADD(MONTH, 1, DATEADD(DAY, -DAY(DATEADD(MONTH, -2, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(MONTH, -2, CAST(CURRENT_TIMESTAMP AS DATE))))) as DATETIME) 
    GROUP BY 
        "Customer_Details_Month_End"."Customer_Number_External", 
        "Cust_Month_End_Flag_Details"."Sales_Program_Code_1"
    ) "PM_Segment"