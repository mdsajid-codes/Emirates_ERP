package com.example.multi_tanent.accounts.entity.coa;

import com.example.multi_tanent.accounts.entity.enums.AccountBalanceType;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chart_of_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"dimensions"})
public class ChartOfAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "account_code", unique = true, nullable = false, length = 20)
    private String accountCode;

    @Column(nullable = false, length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountBalanceType accountType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AccountSection section;

    @Column(name = "parent_group", length = 200)
    private String parentGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ChartOfAccount parent;

    @Builder.Default
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChartOfAccount> children = new ArrayList<>();

    @Builder.Default
    @Column(name = "level")
    private Integer level = 1;

    @Builder.Default
    @Column(name = "is_off_balance")
    private Boolean isOffBalance = false;

    @Builder.Default
    @Column(name = "is_quantitative")
    private Boolean isQuantitative = false;

    @Builder.Default
    @Column(length = 3)
    private String currency = "AED";

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AccountDimension> dimensions = new ArrayList<>();

    public void addDimension(AccountDimension dimension) {
        dimensions.add(dimension);
        dimension.setAccount(this);
    }

    public void removeDimension(AccountDimension dimension) {
        dimensions.remove(dimension);
        dimension.setAccount(null);
    }
}
