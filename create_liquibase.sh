mkdir -p src/main/resources/db/changelog/account

cat << 'XML' > src/main/resources/db/changelog/account/070-create-acc-banks.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-070-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_banks">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="swift_code" type="VARCHAR(20)"/>
            <column name="country" type="VARCHAR(100)"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/071-create-acc-bank-accounts.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-071-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_bank_accounts">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="bank_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="account_number" type="VARCHAR(100)"><constraints nullable="false" unique="true"/></column>
            <column name="account_name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="currency_id" type="BIGINT"/>
            <column name="gl_account_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="opening_balance" type="DECIMAL(18,2)" defaultValue="0.00"/>
            <column name="opening_date" type="DATE"/>
            <column name="is_active" type="BOOLEAN" defaultValue="true"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/072-create-acc-payments.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-072-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_payments">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="payment_number" type="VARCHAR(50)"><constraints nullable="false" unique="true"/></column>
            <column name="payment_date" type="DATE"><constraints nullable="false"/></column>
            <column name="payment_type" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="payment_method" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="partner_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="partner_type" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
            <column name="currency_id" type="BIGINT"/>
            <column name="bank_account_id" type="BIGINT"/>
            <column name="reference" type="VARCHAR(200)"/>
            <column name="status" type="VARCHAR(50)" defaultValue="DRAFT"><constraints nullable="false"/></column>
            <column name="journal_entry_id" type="BIGINT"/>
            <column name="pdc_id" type="BIGINT"/>
            <column name="notes" type="TEXT"/>
            <column name="created_by" type="VARCHAR(100)"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>
    <changeSet id="accounts-072-2" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_payment_invoice_allocations">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="payment_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="invoice_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="allocated_amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/073-create-acc-post-dated-cheques.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-073-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_post_dated_cheques">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="pdc_type" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="cheque_number" type="VARCHAR(100)"><constraints nullable="false"/></column>
            <column name="cheque_date" type="DATE"><constraints nullable="false"/></column>
            <column name="amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
            <column name="currency_id" type="BIGINT"/>
            <column name="bank_name" type="VARCHAR(200)"/>
            <column name="bank_account_id" type="BIGINT"/>
            <column name="partner_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="partner_type" type="VARCHAR(50)"/>
            <column name="status" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="payment_id" type="BIGINT"/>
            <column name="step1_journal_entry_id" type="BIGINT"/>
            <column name="step2_journal_entry_id" type="BIGINT"/>
            <column name="bank_charges" type="DECIMAL(10,2)" defaultValue="0"/>
            <column name="notes" type="TEXT"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
            <column name="cleared_at" type="TIMESTAMP"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/074-create-acc-cash-equivalents.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-074-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_cash_equivalents">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="bank_account_id" type="BIGINT"/>
            <column name="amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
            <column name="investment_date" type="DATE"><constraints nullable="false"/></column>
            <column name="maturity_date" type="DATE"><constraints nullable="false"/></column>
            <column name="interest_rate" type="DECIMAL(5,2)"/>
            <column name="gl_account_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="status" type="VARCHAR(50)" defaultValue="ACTIVE"/>
            <column name="journal_entry_id" type="BIGINT"/>
            <column name="maturity_journal_id" type="BIGINT"/>
            <column name="notes" type="TEXT"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/075-create-acc-cash-flow-items.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-075-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_cash_flow_items">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="category" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="display_order" type="INT" defaultValue="0"/>
            <column name="is_inflow" type="BOOLEAN"/>
            <column name="tenant_id" type="VARCHAR(50)"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/076-create-acc-cash-flow-transactions.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-076-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_cash_flow_transactions">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="cash_flow_item_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="payment_id" type="BIGINT"/>
            <column name="journal_entry_id" type="BIGINT"/>
            <column name="amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
            <column name="transaction_date" type="DATE"><constraints nullable="false"/></column>
            <column name="is_inflow" type="BOOLEAN"><constraints nullable="false"/></column>
            <column name="description" type="TEXT"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/077-create-acc-mutual-settlements.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-077-1" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_mutual_settlements">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="settlement_number" type="VARCHAR(50)"><constraints nullable="false" unique="true"/></column>
            <column name="settlement_date" type="DATE"><constraints nullable="false"/></column>
            <column name="partner_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="partner_name" type="VARCHAR(255)"/>
            <column name="currency_id" type="BIGINT"/>
            <column name="settlement_amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
            <column name="status" type="VARCHAR(50)" defaultValue="DRAFT"><constraints nullable="false"/></column>
            <column name="journal_entry_id" type="BIGINT"/>
            <column name="reversal_entry_id" type="BIGINT"/>
            <column name="notes" type="TEXT"/>
            <column name="created_by" type="VARCHAR(100)"/>
            <column name="tenant_id" type="VARCHAR(50)"><constraints nullable="false"/></column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
        </createTable>
    </changeSet>
    <changeSet id="accounts-077-2" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_mutual_settlement_ap_lines">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="settlement_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="invoice_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="invoice_number" type="VARCHAR(100)"/>
            <column name="invoice_date" type="DATE"/>
            <column name="invoice_total" type="DECIMAL(18,2)"/>
            <column name="allocated_amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>
    <changeSet id="accounts-077-3" author="sajid" context="ACCOUNTS">
        <createTable tableName="acc_mutual_settlement_ar_lines">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="settlement_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="invoice_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="invoice_number" type="VARCHAR(100)"/>
            <column name="invoice_date" type="DATE"/>
            <column name="invoice_total" type="DECIMAL(18,2)"/>
            <column name="allocated_amount" type="DECIMAL(18,2)"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>
</databaseChangeLog>
XML

cat << 'XML' > src/main/resources/db/changelog/account/078-seed-acc-cash-flow-items.xml
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">
    <changeSet id="accounts-078-1" author="sajid" context="ACCOUNTS">
        <!-- OPERATING -->
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash Receipts from Customers"/>
            <column name="category" value="OPERATING"/>
            <column name="is_inflow" valueBoolean="true"/>
            <column name="display_order" valueNumeric="1"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash Payments to Suppliers"/>
            <column name="category" value="OPERATING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="2"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash Paid to Employees"/>
            <column name="category" value="OPERATING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="3"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash from Other Operating Income"/>
            <column name="category" value="OPERATING"/>
            <column name="is_inflow" valueBoolean="true"/>
            <column name="display_order" valueNumeric="4"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash Paid for Operating Expenses"/>
            <column name="category" value="OPERATING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="5"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>

        <!-- INVESTING -->
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Purchase of Fixed Assets"/>
            <column name="category" value="INVESTING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="10"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Proceeds from Asset Disposals"/>
            <column name="category" value="INVESTING"/>
            <column name="is_inflow" valueBoolean="true"/>
            <column name="display_order" valueNumeric="11"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash Equivalents - Investment"/>
            <column name="category" value="INVESTING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="12"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Cash Equivalents - Withdrawal"/>
            <column name="category" value="INVESTING"/>
            <column name="is_inflow" valueBoolean="true"/>
            <column name="display_order" valueNumeric="13"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>

        <!-- FINANCING -->
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Proceeds from Loans"/>
            <column name="category" value="FINANCING"/>
            <column name="is_inflow" valueBoolean="true"/>
            <column name="display_order" valueNumeric="20"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Repayment of Loans"/>
            <column name="category" value="FINANCING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="21"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Capital Injections"/>
            <column name="category" value="FINANCING"/>
            <column name="is_inflow" valueBoolean="true"/>
            <column name="display_order" valueNumeric="22"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
        <insert tableName="acc_cash_flow_items">
            <column name="name" value="Dividends Paid"/>
            <column name="category" value="FINANCING"/>
            <column name="is_inflow" valueBoolean="false"/>
            <column name="display_order" valueNumeric="23"/>
            <column name="tenant_id" value="DEFAULT"/>
        </insert>
    </changeSet>
</databaseChangeLog>
XML

chmod +x create_liquibase.sh
./create_liquibase.sh
