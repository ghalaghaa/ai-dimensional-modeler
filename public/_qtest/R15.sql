WITH 
"TQ0_Query_CurrYearYTD" AS 
    (
    SELECT
        "RBG_Daily_Consolidated_MIS_BU2"."Sort_Order" AS "Sort_Order", 
        ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU2"."Row_Name")) AS "Row_Name", 
        "RBG_Daily_Consolidated_MIS_BU2"."Column_Sort" AS "Column_Sort", 
        "RBG_Daily_Consolidated_MIS_BU2"."Account_Balance_Date" AS "Account_Balance_Date", 
        "RBG_Daily_Consolidated_MIS_BU2"."Disp_Account_Balance_Date" AS "Disp_Account_Balance_Date", 
        "RBG_Daily_Consolidated_MIS_BU2"."Report_Year" AS "Report_Year", 
        "RBG_Daily_Consolidated_MIS_BU2"."Report_Month" AS "Report_Month", 
        "D_Month_Number_and_Name1"."Month_Name" AS "Month_Name", 
        "RBG_Daily_Consolidated_MIS_BU2"."Report_Day" AS "Report_Day", 
        MAX("RBG_Daily_Consolidated_MIS_BU2"."Report_Year")
            OVER(
            ) AS "Max1", 
        "RBG_Daily_Consolidated_MIS_BU2"."Balance_SAR" AS "Balance_SAR"
    FROM
        "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name1"
            INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU2"
            ON "D_Month_Number_and_Name1"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU2"."Report_Month" 
    WHERE 
        "RBG_Daily_Consolidated_MIS_BU2"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
        "RBG_Daily_Consolidated_MIS_BU2"."Column_Sort" = 8
    ), 
"Query_CurrYearYTD" AS 
    (
    SELECT
        "TQ0_Query_CurrYearYTD"."Sort_Order" AS "Sort_Order", 
        "TQ0_Query_CurrYearYTD"."Row_Name" AS "Row_Name", 
        "TQ0_Query_CurrYearYTD"."Column_Sort" AS "Column_Sort", 
        "TQ0_Query_CurrYearYTD"."Account_Balance_Date" AS "Account_Balance_Date", 
        "TQ0_Query_CurrYearYTD"."Disp_Account_Balance_Date" AS "Disp_Account_Balance_Date", 
        "TQ0_Query_CurrYearYTD"."Report_Year" AS "Report_Year", 
        "TQ0_Query_CurrYearYTD"."Report_Month" AS "Report_Month", 
        "TQ0_Query_CurrYearYTD"."Month_Name" AS "Month_Name", 
        "TQ0_Query_CurrYearYTD"."Report_Day" AS "Report_Day", 
        SUM("TQ0_Query_CurrYearYTD"."Balance_SAR") AS "Balance_SAR", 
        "TQ0_Query_CurrYearYTD"."Report_Month" AS "Report_Month_Sort"
    FROM
        "TQ0_Query_CurrYearYTD" 
    WHERE 
        "TQ0_Query_CurrYearYTD"."Report_Year" = "TQ0_Query_CurrYearYTD"."Max1" 
    GROUP BY 
        "TQ0_Query_CurrYearYTD"."Sort_Order", 
        "TQ0_Query_CurrYearYTD"."Row_Name", 
        "TQ0_Query_CurrYearYTD"."Column_Sort", 
        "TQ0_Query_CurrYearYTD"."Account_Balance_Date", 
        "TQ0_Query_CurrYearYTD"."Disp_Account_Balance_Date", 
        "TQ0_Query_CurrYearYTD"."Report_Year", 
        "TQ0_Query_CurrYearYTD"."Report_Month", 
        "TQ0_Query_CurrYearYTD"."Month_Name", 
        "TQ0_Query_CurrYearYTD"."Report_Day"
    ), 
"Query_CurrYear_MonAVG" AS 
    (
    SELECT
        "D1"."C0" AS "Sort_Order", 
        "D1"."C1" AS "Row_Name", 
        "D1"."C2" AS "Column_Sort", 
        "D1"."C3" AS "Account_Balance_Date", 
        "D1"."C4" AS "Disp_Account_Balance_Date", 
        "D1"."C5" AS "Report_Year", 
        "D1"."C6" AS "Report_Month", 
        "D1"."C7" AS "Month_Name", 
        "D1"."C8" AS "Report_Day", 
        SUM("D1"."C9") AS "Balance_SAR", 
        "D1"."C6" AS "Report_Month_Sort"
    FROM
        (
        SELECT
            "RBG_Daily_Consolidated_MIS_BU6"."Sort_Order" AS "C0", 
            ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU6"."Row_Name")) AS "C1", 
            "RBG_Daily_Consolidated_MIS_BU6"."Column_Sort" AS "C2", 
            "RBG_Daily_Consolidated_MIS_BU6"."Account_Balance_Date" AS "C3", 
            "RBG_Daily_Consolidated_MIS_BU6"."Disp_Account_Balance_Date" AS "C4", 
            "RBG_Daily_Consolidated_MIS_BU6"."Report_Year" AS "C5", 
            "RBG_Daily_Consolidated_MIS_BU6"."Report_Month" AS "C6", 
            "D_Month_Number_and_Name5"."Month_Name" AS "C7", 
            "RBG_Daily_Consolidated_MIS_BU6"."Report_Day" AS "C8", 
            "RBG_Daily_Consolidated_MIS_BU6"."Balance_SAR" AS "C9"
        FROM
            "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name5"
                INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU6"
                ON "D_Month_Number_and_Name5"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU6"."Report_Month" 
        WHERE 
            "RBG_Daily_Consolidated_MIS_BU6"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "RBG_Daily_Consolidated_MIS_BU6"."Column_Sort" = 7
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
        "D1"."C8"
    ), 
"Query_CurrYear_Today" AS 
    (
    SELECT
        "D1"."C0" AS "Sort_Order", 
        "D1"."C1" AS "Row_Name", 
        "D1"."C2" AS "Column_Sort", 
        "D1"."C3" AS "Account_Balance_Date", 
        "D1"."C4" AS "Disp_Account_Balance_Date", 
        "D1"."C5" AS "Report_Year", 
        "D1"."C6" AS "Report_Month", 
        "D1"."C7" AS "Month_Name", 
        "D1"."C8" AS "Report_Day", 
        SUM("D1"."C9") AS "Balance_SAR", 
        "D1"."C6" AS "Report_Month_Sort"
    FROM
        (
        SELECT
            "RBG_Daily_Consolidated_MIS_BU9"."Sort_Order" AS "C0", 
            ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU9"."Row_Name")) AS "C1", 
            "RBG_Daily_Consolidated_MIS_BU9"."Column_Sort" AS "C2", 
            "RBG_Daily_Consolidated_MIS_BU9"."Account_Balance_Date" AS "C3", 
            "RBG_Daily_Consolidated_MIS_BU9"."Disp_Account_Balance_Date" AS "C4", 
            "RBG_Daily_Consolidated_MIS_BU9"."Report_Year" AS "C5", 
            "RBG_Daily_Consolidated_MIS_BU9"."Report_Month" AS "C6", 
            "D_Month_Number_and_Name8"."Month_Name" AS "C7", 
            "RBG_Daily_Consolidated_MIS_BU9"."Report_Day" AS "C8", 
            "RBG_Daily_Consolidated_MIS_BU9"."Balance_SAR" AS "C9"
        FROM
            "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name8"
                INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU9"
                ON "D_Month_Number_and_Name8"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU9"."Report_Month" 
        WHERE 
            "RBG_Daily_Consolidated_MIS_BU9"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "RBG_Daily_Consolidated_MIS_BU9"."Column_Sort" = 5
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
        "D1"."C8"
    ), 
"Query_Main_RP_Actual_Value" AS 
    (
    SELECT
        "D1"."C0" AS "Sort_Order", 
        "D1"."C1" AS "Row_Name", 
        "D1"."C2" AS "Column_Sort", 
        "D1"."C3" AS "Account_Balance_Date", 
        "D1"."C4" AS "Disp_Account_Balance_Date", 
        "D1"."C5" AS "Report_Year", 
        "D1"."C6" AS "Report_Month", 
        "D1"."C7" AS "Month_Name", 
        "D1"."C8" AS "Report_Day", 
        SUM("D1"."C9") AS "Balance_SAR", 
        "D1"."C6" AS "Report_Month_Sort"
    FROM
        (
        SELECT
            "RBG_Daily_Consolidated_MIS_BU12"."Sort_Order" AS "C0", 
            ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU12"."Row_Name")) AS "C1", 
            "RBG_Daily_Consolidated_MIS_BU12"."Column_Sort" AS "C2", 
            "RBG_Daily_Consolidated_MIS_BU12"."Account_Balance_Date" AS "C3", 
            "RBG_Daily_Consolidated_MIS_BU12"."Disp_Account_Balance_Date" AS "C4", 
            "RBG_Daily_Consolidated_MIS_BU12"."Report_Year" AS "C5", 
            "RBG_Daily_Consolidated_MIS_BU12"."Report_Month" AS "C6", 
            "D_Month_Number_and_Name11"."Month_Name" AS "C7", 
            "RBG_Daily_Consolidated_MIS_BU12"."Report_Day" AS "C8", 
            CASE 
                WHEN 
                    "RBG_Daily_Consolidated_MIS_BU12"."Column_Sort" IN ( 
                        0, 
                        1, 
                        2, 
                        3, 
                        4, 
                        6, 
                        8 ) AND
                    NOT ( "RBG_Daily_Consolidated_MIS_BU12"."Sort_Order" IN ( 
                        14, 
                        16, 
                        17, 
                        18, 
                        19, 
                        20, 
                        21, 
                        22, 
                        23, 
                        40, 
                        42 ) )
                    THEN
                        -1 * "RBG_Daily_Consolidated_MIS_BU12"."Balance_SAR"
                ELSE "RBG_Daily_Consolidated_MIS_BU12"."Balance_SAR"
            END AS "C9"
        FROM
            "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name11"
                INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU12"
                ON "D_Month_Number_and_Name11"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU12"."Report_Month" 
        WHERE 
            "RBG_Daily_Consolidated_MIS_BU12"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "RBG_Daily_Consolidated_MIS_BU12"."Column_Sort" IN ( 
                1 ) AND
            "RBG_Daily_Consolidated_MIS_BU12"."Account_Balance_Date" >= CAST(DATEADD(DAY, -1 * DATEDIFF(DAY, DATEADD(DAY, -DAY(DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))) + 1, DATEADD(DAY, -1, CAST(CURRENT_TIMESTAMP AS DATE))), DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE))), CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME)
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
        "D1"."C8"
    ), 
"Query_Main_RP_Colum" AS 
    (
    SELECT
        "D1"."C0" AS "Sort_Order", 
        "D1"."C1" AS "Row_Name", 
        "D1"."C2" AS "Column_Sort", 
        "D1"."C3" AS "Account_Balance_Date", 
        "D1"."C4" AS "Disp_Account_Balance_Date", 
        "D1"."C5" AS "Report_Year", 
        "D1"."C6" AS "Report_Month", 
        "D1"."C7" AS "Month_Name", 
        "D1"."C8" AS "Report_Day", 
        SUM("D1"."C10") AS "Balance_SAR", 
        "D1"."C9" AS "Report_Month_Sort"
    FROM
        (
        SELECT
            "RBG_Daily_Consolidated_MIS_BU15"."Sort_Order" AS "C0", 
            ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU15"."Row_Name")) AS "C1", 
            "RBG_Daily_Consolidated_MIS_BU15"."Column_Sort" AS "C2", 
            "RBG_Daily_Consolidated_MIS_BU15"."Account_Balance_Date" AS "C3", 
            "RBG_Daily_Consolidated_MIS_BU15"."Disp_Account_Balance_Date" AS "C4", 
            "RBG_Daily_Consolidated_MIS_BU15"."Report_Year" AS "C5", 
            CASE 
                WHEN 
                    "RBG_Daily_Consolidated_MIS_BU15"."Column_Sort" IN ( 
                        0, 
                        1, 
                        2, 
                        3, 
                        4, 
                        6, 
                        8 ) AND
                    "RBG_Daily_Consolidated_MIS_BU15"."Report_Month" = DATEPART(MONTH, "RBG_Daily_Consolidated_MIS_BU15"."Account_Balance_Date")
                    THEN
                        DATEPART(MONTH, "RBG_Daily_Consolidated_MIS_BU15"."Account_Balance_Date")
            END AS "C6", 
            "D_Month_Number_and_Name14"."Month_Name" AS "C7", 
            "RBG_Daily_Consolidated_MIS_BU15"."Report_Day" AS "C8", 
            "RBG_Daily_Consolidated_MIS_BU15"."Report_Month" AS "C9", 
            CASE 
                WHEN 
                    "RBG_Daily_Consolidated_MIS_BU15"."Column_Sort" IN ( 
                        0, 
                        1, 
                        2, 
                        3, 
                        4, 
                        6, 
                        8 ) AND
                    NOT ( "RBG_Daily_Consolidated_MIS_BU15"."Sort_Order" IN ( 
                        14, 
                        16, 
                        17, 
                        18, 
                        19, 
                        20, 
                        21, 
                        22, 
                        23, 
                        40, 
                        42 ) )
                    THEN
                        -1 * "RBG_Daily_Consolidated_MIS_BU15"."Balance_SAR"
                ELSE "RBG_Daily_Consolidated_MIS_BU15"."Balance_SAR"
            END AS "C10"
        FROM
            "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name14"
                INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU15"
                ON "D_Month_Number_and_Name14"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU15"."Report_Month" 
        WHERE 
            "RBG_Daily_Consolidated_MIS_BU15"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            NOT ( "RBG_Daily_Consolidated_MIS_BU15"."Column_Sort" IN ( 
                1, 
                5, 
                7, 
                20, 
                25 ) )
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
        "D1"."C9"
    ), 
"TQ0_Query_PrevYearYTD" AS 
    (
    SELECT
        "RBG_Daily_Consolidated_MIS_BU18"."Sort_Order" AS "Sort_Order", 
        ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU18"."Row_Name")) AS "Row_Name", 
        "RBG_Daily_Consolidated_MIS_BU18"."Column_Sort" AS "Column_Sort", 
        "RBG_Daily_Consolidated_MIS_BU18"."Account_Balance_Date" AS "Account_Balance_Date", 
        "RBG_Daily_Consolidated_MIS_BU18"."Disp_Account_Balance_Date" AS "Disp_Account_Balance_Date", 
        "RBG_Daily_Consolidated_MIS_BU18"."Report_Year" AS "Report_Year", 
        "RBG_Daily_Consolidated_MIS_BU18"."Report_Month" AS "Report_Month", 
        "D_Month_Number_and_Name17"."Month_Name" AS "Month_Name", 
        "RBG_Daily_Consolidated_MIS_BU18"."Report_Day" AS "Report_Day", 
        MIN("RBG_Daily_Consolidated_MIS_BU18"."Report_Year")
            OVER(
            ) AS "Min1", 
        "RBG_Daily_Consolidated_MIS_BU18"."Balance_SAR" AS "Balance_SAR"
    FROM
        "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name17"
            INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU18"
            ON "D_Month_Number_and_Name17"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU18"."Report_Month" 
    WHERE 
        "RBG_Daily_Consolidated_MIS_BU18"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
        "RBG_Daily_Consolidated_MIS_BU18"."Column_Sort" = 8
    ), 
"Query_PrevYearYTD" AS 
    (
    SELECT
        "TQ0_Query_PrevYearYTD"."Sort_Order" AS "Sort_Order", 
        "TQ0_Query_PrevYearYTD"."Row_Name" AS "Row_Name", 
        "TQ0_Query_PrevYearYTD"."Column_Sort" AS "Column_Sort", 
        "TQ0_Query_PrevYearYTD"."Account_Balance_Date" AS "Account_Balance_Date", 
        "TQ0_Query_PrevYearYTD"."Disp_Account_Balance_Date" AS "Disp_Account_Balance_Date", 
        "TQ0_Query_PrevYearYTD"."Report_Year" AS "Report_Year", 
        "TQ0_Query_PrevYearYTD"."Report_Month" AS "Report_Month", 
        "TQ0_Query_PrevYearYTD"."Month_Name" AS "Month_Name", 
        "TQ0_Query_PrevYearYTD"."Report_Day" AS "Report_Day", 
        SUM("TQ0_Query_PrevYearYTD"."Balance_SAR") AS "Balance_SAR", 
        "TQ0_Query_PrevYearYTD"."Report_Month" AS "Report_Month_Sort"
    FROM
        "TQ0_Query_PrevYearYTD" 
    WHERE 
        "TQ0_Query_PrevYearYTD"."Report_Year" = "TQ0_Query_PrevYearYTD"."Min1" 
    GROUP BY 
        "TQ0_Query_PrevYearYTD"."Sort_Order", 
        "TQ0_Query_PrevYearYTD"."Row_Name", 
        "TQ0_Query_PrevYearYTD"."Column_Sort", 
        "TQ0_Query_PrevYearYTD"."Account_Balance_Date", 
        "TQ0_Query_PrevYearYTD"."Disp_Account_Balance_Date", 
        "TQ0_Query_PrevYearYTD"."Report_Year", 
        "TQ0_Query_PrevYearYTD"."Report_Month", 
        "TQ0_Query_PrevYearYTD"."Month_Name", 
        "TQ0_Query_PrevYearYTD"."Report_Day"
    ), 
"Query_PrevYear_Colsong" AS 
    (
    SELECT
        "D1"."C0" AS "Sort_Order", 
        "D1"."C1" AS "Row_Name", 
        "D1"."C2" AS "Column_Sort", 
        "D1"."C3" AS "Account_Balance_Date", 
        "D1"."C4" AS "Disp_Account_Balance_Date", 
        "D1"."C5" AS "Report_Year", 
        "D1"."C6" AS "Report_Month", 
        "D1"."C7" AS "Month_Name", 
        "D1"."C8" AS "Report_Day", 
        SUM("D1"."C9") AS "Balance_SAR", 
        "D1"."C6" AS "Report_Month_Sort"
    FROM
        (
        SELECT
            "RBG_Daily_Consolidated_MIS_BU22"."Sort_Order" AS "C0", 
            ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU22"."Row_Name")) AS "C1", 
            "RBG_Daily_Consolidated_MIS_BU22"."Column_Sort" AS "C2", 
            "RBG_Daily_Consolidated_MIS_BU22"."Account_Balance_Date" AS "C3", 
            "RBG_Daily_Consolidated_MIS_BU22"."Disp_Account_Balance_Date" AS "C4", 
            "RBG_Daily_Consolidated_MIS_BU22"."Report_Year" AS "C5", 
            "RBG_Daily_Consolidated_MIS_BU22"."Report_Month" AS "C6", 
            "D_Month_Number_and_Name21"."Month_Name" AS "C7", 
            "RBG_Daily_Consolidated_MIS_BU22"."Report_Day" AS "C8", 
            "RBG_Daily_Consolidated_MIS_BU22"."Balance_SAR" AS "C9"
        FROM
            "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name21"
                INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU22"
                ON "D_Month_Number_and_Name21"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU22"."Report_Month" 
        WHERE 
            "RBG_Daily_Consolidated_MIS_BU22"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "RBG_Daily_Consolidated_MIS_BU22"."Column_Sort" = 4
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
        "D1"."C8"
    ), 
"Query_PrevYear_MonAVG" AS 
    (
    SELECT
        "D1"."C0" AS "Sort_Order", 
        "D1"."C1" AS "Row_Name", 
        "D1"."C2" AS "Column_Sort", 
        "D1"."C3" AS "Account_Balance_Date", 
        "D1"."C4" AS "Disp_Account_Balance_Date", 
        "D1"."C5" AS "Report_Year", 
        "D1"."C6" AS "Report_Month", 
        "D1"."C7" AS "Month_Name", 
        "D1"."C8" AS "Report_Day", 
        SUM("D1"."C9") AS "Balance_SAR", 
        "D1"."C6" AS "Report_Month_Sort"
    FROM
        (
        SELECT
            "RBG_Daily_Consolidated_MIS_BU"."Sort_Order" AS "C0", 
            ltrim(rtrim("RBG_Daily_Consolidated_MIS_BU"."Row_Name")) AS "C1", 
            "RBG_Daily_Consolidated_MIS_BU"."Column_Sort" AS "C2", 
            "RBG_Daily_Consolidated_MIS_BU"."Account_Balance_Date" AS "C3", 
            "RBG_Daily_Consolidated_MIS_BU"."Disp_Account_Balance_Date" AS "C4", 
            "RBG_Daily_Consolidated_MIS_BU"."Report_Year" AS "C5", 
            "RBG_Daily_Consolidated_MIS_BU"."Report_Month" AS "C6", 
            "D_Month_Number_and_Name"."Month_Name" AS "C7", 
            "RBG_Daily_Consolidated_MIS_BU"."Report_Day" AS "C8", 
            "RBG_Daily_Consolidated_MIS_BU"."Balance_SAR" AS "C9"
        FROM
            "Finance_MIS"."dbo"."D_Month" "D_Month_Number_and_Name"
                INNER JOIN "Finance_MIS"."dbo"."F_Daily_RBG_MIS" "RBG_Daily_Consolidated_MIS_BU"
                ON "D_Month_Number_and_Name"."Month_Num" = "RBG_Daily_Consolidated_MIS_BU"."Report_Month" 
        WHERE 
            "RBG_Daily_Consolidated_MIS_BU"."Report_Date" = CAST(DATEADD(DAY, 0, CAST(CURRENT_TIMESTAMP AS DATE)) as DATETIME) AND
            "RBG_Daily_Consolidated_MIS_BU"."Column_Sort" = 6
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
        "D1"."C8"
    ), 
"Query_2DayVsPrevLastDay" AS 
    (
    SELECT
        "Query_CurrYear_Today"."Sort_Order" AS "Sort_Order", 
        "Query_CurrYear_Today"."Row_Name" AS "Row_Name", 
        "Query_CurrYear_Today"."Column_Sort" AS "Column_Sort", 
        "Query_CurrYear_Today"."Account_Balance_Date" AS "Account_Balance_Date", 
        "Query_CurrYear_Today"."Disp_Account_Balance_Date" AS "Disp_Account_Balance_Date", 
        "Query_CurrYear_Today"."Report_Year" AS "Report_Year", 
        "Query_CurrYear_Today"."Report_Month" AS "Report_Month", 
        "Query_CurrYear_Today"."Month_Name" AS "Month_Name", 
        "Query_CurrYear_Today"."Report_Day" AS "Report_Day", 
        CAST(SUM("Query_CurrYear_Today"."Balance_SAR") AS DOUBLE PRECISION) / NULLIF(SUM("Query_PrevYear_Colsong"."Balance_SAR"), 0) - 1 AS "Balance_SAR", 
        "Query_PrevYear_Colsong"."Report_Month_Sort" AS "Report_Month_Sort"
    FROM
        "Query_PrevYear_Colsong"
            INNER JOIN "Query_CurrYear_Today"
            ON 
                "Query_PrevYear_Colsong"."Sort_Order" = "Query_CurrYear_Today"."Sort_Order" AND
                "Query_PrevYear_Colsong"."Row_Name" = "Query_CurrYear_Today"."Row_Name" 
    GROUP BY 
        "Query_CurrYear_Today"."Sort_Order", 
        "Query_CurrYear_Today"."Row_Name", 
        "Query_CurrYear_Today"."Column_Sort", 
        "Query_CurrYear_Today"."Account_Balance_Date", 
        "Query_CurrYear_Today"."Disp_Account_Balance_Date", 
        "Query_CurrYear_Today"."Report_Year", 
        "Query_CurrYear_Today"."Report_Month", 
        "Query_CurrYear_Today"."Month_Name", 
        "Query_CurrYear_Today"."Report_Day", 
        "Query_PrevYear_Colsong"."Report_Month_Sort"
    ), 
"Query_CurMonAVG_PrevYAvg" AS 
    (
    SELECT
        "Query_CurrYear_MonAVG"."Sort_Order" AS "Sort_Order", 
        "Query_CurrYear_MonAVG"."Row_Name" AS "Row_Name", 
        "Query_CurrYear_MonAVG"."Column_Sort" AS "Column_Sort", 
        "Query_CurrYear_MonAVG"."Account_Balance_Date" AS "Account_Balance_Date", 
        "Query_CurrYear_MonAVG"."Disp_Account_Balance_Date" AS "Disp_Account_Balance_Date", 
        "Query_CurrYear_MonAVG"."Report_Year" AS "Report_Year", 
        "Query_CurrYear_MonAVG"."Report_Month" AS "Report_Month", 
        "Query_CurrYear_MonAVG"."Month_Name" AS "Month_Name", 
        "Query_CurrYear_MonAVG"."Report_Day" AS "Report_Day", 
        CAST(SUM("Query_CurrYear_MonAVG"."Balance_SAR") AS DOUBLE PRECISION) / NULLIF(SUM("Query_PrevYear_MonAVG"."Balance_SAR"), 0) - 1 AS "Balance_SAR", 
        "Query_PrevYear_MonAVG"."Report_Month_Sort" AS "Report_Month_Sort"
    FROM
        "Query_PrevYear_MonAVG"
            INNER JOIN "Query_CurrYear_MonAVG"
            ON 
                "Query_PrevYear_MonAVG"."Sort_Order" = "Query_CurrYear_MonAVG"."Sort_Order" AND
                "Query_PrevYear_MonAVG"."Row_Name" = "Query_CurrYear_MonAVG"."Row_Name" 
    GROUP BY 
        "Query_CurrYear_MonAVG"."Sort_Order", 
        "Query_CurrYear_MonAVG"."Row_Name", 
        "Query_CurrYear_MonAVG"."Column_Sort", 
        "Query_CurrYear_MonAVG"."Account_Balance_Date", 
        "Query_CurrYear_MonAVG"."Disp_Account_Balance_Date", 
        "Query_CurrYear_MonAVG"."Report_Year", 
        "Query_CurrYear_MonAVG"."Report_Month", 
        "Query_CurrYear_MonAVG"."Month_Name", 
        "Query_CurrYear_MonAVG"."Report_Day", 
        "Query_PrevYear_MonAVG"."Report_Month_Sort"
    ), 
"Query_Growth_Perc" AS 
    (
    SELECT
        "Query_CurrYearYTD"."Sort_Order" AS "Sort_Order", 
        "Query_CurrYearYTD"."Row_Name" AS "Row_Name", 
        10 AS "Column_Sort", 
        "Query_CurrYearYTD"."Account_Balance_Date" AS "Account_Balance_Date", 
        'Growth Perc' AS "Disp_Account_Balance_Date", 
        "Query_CurrYearYTD"."Report_Year" AS "Report_Year", 
        "Query_CurrYearYTD"."Report_Month" AS "Report_Month", 
        "Query_CurrYearYTD"."Month_Name" AS "Month_Name", 
        "Query_CurrYearYTD"."Report_Day" AS "Report_Day", 
        CAST(SUM("Query_CurrYearYTD"."Balance_SAR") AS DOUBLE PRECISION) / NULLIF(SUM("Query_PrevYearYTD"."Balance_SAR"), 0) - 1 AS "Balance_SAR", 
        "Query_PrevYearYTD"."Report_Month_Sort" AS "Report_Month_Sort"
    FROM
        "Query_PrevYearYTD"
            INNER JOIN "Query_CurrYearYTD"
            ON 
                "Query_PrevYearYTD"."Sort_Order" = "Query_CurrYearYTD"."Sort_Order" AND
                "Query_PrevYearYTD"."Row_Name" = "Query_CurrYearYTD"."Row_Name" 
    GROUP BY 
        "Query_CurrYearYTD"."Sort_Order", 
        "Query_CurrYearYTD"."Row_Name", 
        "Query_CurrYearYTD"."Account_Balance_Date", 
        "Query_CurrYearYTD"."Report_Year", 
        "Query_CurrYearYTD"."Report_Month", 
        "Query_CurrYearYTD"."Month_Name", 
        "Query_CurrYearYTD"."Report_Day", 
        "Query_PrevYearYTD"."Report_Month_Sort"
    )
SELECT
    "D1"."C0" AS "Sort_Order", 
    "D1"."C1" AS "Row_Name", 
    "D1"."C2" AS "Column_Sort", 
    "D1"."C3" AS "Account_Balance_Date", 
    "D1"."C4" AS "Disp_Account_Balance_Date", 
    "D1"."C5" AS "Report_Year", 
    "D1"."C6" AS "Month_Name", 
    "D1"."C7" AS "Report_Day", 
    "D1"."C8" AS "Balance_SAR", 
    "D1"."C9" AS "Report_Month_Sort"
FROM
    (
    SELECT
        "Union1"."Sort_Order" AS "C0", 
        CASE 
            WHEN "Union1"."Sort_Order" = 6 THEN 'Clearing, etc'
            WHEN "Union1"."Sort_Order" = 11 THEN 'Sub Total Shares trading NIBs'
            ELSE "Union1"."Row_Name"
        END AS "C1", 
        "Union1"."Column_Sort" AS "C2", 
        "Union1"."Account_Balance_Date" AS "C3", 
        "Union1"."Disp_Account_Balance_Date" AS "C4", 
        "Union1"."Report_Year" AS "C5", 
        "Union1"."Month_Name" AS "C6", 
        "Union1"."Report_Day" AS "C7", 
        "Union1"."Balance_SAR" AS "C8", 
        "Union1"."Report_Month_Sort" AS "C9"
    FROM
        (
        SELECT
            "Query_Main_RP_Colum"."Sort_Order", 
            "Query_Main_RP_Colum"."Row_Name", 
            "Query_Main_RP_Colum"."Column_Sort", 
            "Query_Main_RP_Colum"."Account_Balance_Date", 
            "Query_Main_RP_Colum"."Disp_Account_Balance_Date", 
            "Query_Main_RP_Colum"."Report_Year", 
            "Query_Main_RP_Colum"."Report_Month", 
            "Query_Main_RP_Colum"."Month_Name", 
            "Query_Main_RP_Colum"."Report_Day", 
            "Query_Main_RP_Colum"."Balance_SAR", 
            "Query_Main_RP_Colum"."Report_Month_Sort"
        FROM
            "Query_Main_RP_Colum"
        
        UNION
        
        SELECT
            "Query_2DayVsPrevLastDay"."Sort_Order", 
            "Query_2DayVsPrevLastDay"."Row_Name", 
            "Query_2DayVsPrevLastDay"."Column_Sort", 
            "Query_2DayVsPrevLastDay"."Account_Balance_Date", 
            "Query_2DayVsPrevLastDay"."Disp_Account_Balance_Date", 
            "Query_2DayVsPrevLastDay"."Report_Year", 
            "Query_2DayVsPrevLastDay"."Report_Month", 
            "Query_2DayVsPrevLastDay"."Month_Name", 
            "Query_2DayVsPrevLastDay"."Report_Day", 
            "Query_2DayVsPrevLastDay"."Balance_SAR", 
            "Query_2DayVsPrevLastDay"."Report_Month_Sort"
        FROM
            "Query_2DayVsPrevLastDay"
        
        UNION
        
        SELECT
            "Query_CurMonAVG_PrevYAvg"."Sort_Order", 
            "Query_CurMonAVG_PrevYAvg"."Row_Name", 
            "Query_CurMonAVG_PrevYAvg"."Column_Sort", 
            "Query_CurMonAVG_PrevYAvg"."Account_Balance_Date", 
            "Query_CurMonAVG_PrevYAvg"."Disp_Account_Balance_Date", 
            "Query_CurMonAVG_PrevYAvg"."Report_Year", 
            "Query_CurMonAVG_PrevYAvg"."Report_Month", 
            "Query_CurMonAVG_PrevYAvg"."Month_Name", 
            "Query_CurMonAVG_PrevYAvg"."Report_Day", 
            "Query_CurMonAVG_PrevYAvg"."Balance_SAR", 
            "Query_CurMonAVG_PrevYAvg"."Report_Month_Sort"
        FROM
            "Query_CurMonAVG_PrevYAvg"
        
        UNION
        
        SELECT
            "Query_Growth_Perc"."Sort_Order", 
            "Query_Growth_Perc"."Row_Name", 
            "Query_Growth_Perc"."Column_Sort", 
            "Query_Growth_Perc"."Account_Balance_Date", 
            "Query_Growth_Perc"."Disp_Account_Balance_Date", 
            "Query_Growth_Perc"."Report_Year", 
            "Query_Growth_Perc"."Report_Month", 
            "Query_Growth_Perc"."Month_Name", 
            "Query_Growth_Perc"."Report_Day", 
            "Query_Growth_Perc"."Balance_SAR", 
            "Query_Growth_Perc"."Report_Month_Sort"
        FROM
            "Query_Growth_Perc"
        
        UNION
        
        SELECT
            "Query_Main_RP_Actual_Value"."Sort_Order", 
            "Query_Main_RP_Actual_Value"."Row_Name", 
            "Query_Main_RP_Actual_Value"."Column_Sort", 
            "Query_Main_RP_Actual_Value"."Account_Balance_Date", 
            "Query_Main_RP_Actual_Value"."Disp_Account_Balance_Date", 
            "Query_Main_RP_Actual_Value"."Report_Year", 
            "Query_Main_RP_Actual_Value"."Report_Month", 
            "Query_Main_RP_Actual_Value"."Month_Name", 
            "Query_Main_RP_Actual_Value"."Report_Day", 
            "Query_Main_RP_Actual_Value"."Balance_SAR", 
            "Query_Main_RP_Actual_Value"."Report_Month_Sort"
        FROM
            "Query_Main_RP_Actual_Value"
        ) "Union1"("Sort_Order", "Row_Name", "Column_Sort", "Account_Balance_Date", "Disp_Account_Balance_Date", "Report_Year", "Report_Month", "Month_Name", "Report_Day", "Balance_SAR", "Report_Month_Sort")
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
    "D1"."C9"