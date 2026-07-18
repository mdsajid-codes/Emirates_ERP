mkdir -p src/main/java/com/example/multi_tanent/accounts/entity/enums

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/PaymentType.java
package com.example.multi_tanent.accounts.entity.enums;

public enum PaymentType {
    AP_PAYMENT,
    AR_RECEIPT,
    PREPAYMENT_OUT,
    PREPAYMENT_IN
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/PaymentMethod.java
package com.example.multi_tanent.accounts.entity.enums;

public enum PaymentMethod {
    BANK,
    CASH,
    PDC,
    MUTUAL_SETTLEMENT
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/PaymentStatus.java
package com.example.multi_tanent.accounts.entity.enums;

public enum PaymentStatus {
    DRAFT,
    POSTED,
    REVERSED
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/PdcType.java
package com.example.multi_tanent.accounts.entity.enums;

public enum PdcType {
    RECEIVED,
    ISSUED
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/PdcStatus.java
package com.example.multi_tanent.accounts.entity.enums;

public enum PdcStatus {
    PENDING_DEPOSIT,
    ISSUED,
    DEPOSITED,
    CLEARED,
    BOUNCED,
    CANCELLED
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/CashEquivStatus.java
package com.example.multi_tanent.accounts.entity.enums;

public enum CashEquivStatus {
    ACTIVE,
    MATURED,
    WITHDRAWN
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/CashFlowCategory.java
package com.example.multi_tanent.accounts.entity.enums;

public enum CashFlowCategory {
    OPERATING,
    INVESTING,
    FINANCING
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/entity/enums/SettlementStatus.java
package com.example.multi_tanent.accounts.entity.enums;

public enum SettlementStatus {
    DRAFT,
    POSTED,
    REVERSED
}
JAVA

chmod +x create_enums.sh
./create_enums.sh
