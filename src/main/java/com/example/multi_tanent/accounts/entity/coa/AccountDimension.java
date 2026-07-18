package com.example.multi_tanent.accounts.entity.coa;

import com.example.multi_tanent.accounts.entity.enums.DimensionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "account_dimensions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"account"})
public class AccountDimension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dimension_id")
    private Long dimensionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private ChartOfAccount account;

    @Enumerated(EnumType.STRING)
    @Column(name = "dimension_type", nullable = false, length = 50)
    private DimensionType dimensionType;

    @Builder.Default
    @Column(name = "track_amount")
    private Boolean trackAmount = true;

    @Builder.Default
    @Column(name = "track_quantitative")
    private Boolean trackQuantitative = false;

    @Builder.Default
    @Column(name = "turnovers_only")
    private Boolean turnoversOnly = false;
}
