package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crm_todo_labels", uniqueConstraints = @UniqueConstraint(name = "uk_todo_label_name_per_tenant", columnNames = {
                "tenant_id", "name" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmTodoLabel {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_todo_label_tenant"))
        private Tenant tenant;

        @Column(nullable = false, length = 100)
        private String name;

        @Column(length = 7, name = "color_hex") // "#A1B2C3" or "A1B2C3"
        private String colorHex;

        @Column(nullable = false)
        @Builder.Default
        private boolean starred = false;
}
