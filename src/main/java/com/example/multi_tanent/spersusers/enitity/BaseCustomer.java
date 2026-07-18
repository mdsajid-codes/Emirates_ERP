package com.example.multi_tanent.spersusers.enitity;

import com.example.multi_tanent.spersusers.base.PartyBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "base_customers")
@Getter
@Setter
public class BaseCustomer extends PartyBase {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @OneToMany(mappedBy = "party", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OtherPerson> otherPersons = new ArrayList<>();

    @OneToMany(mappedBy = "party", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomField> customFields = new ArrayList<>();

    @OneToMany(mappedBy = "party", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BaseBankDetails> bankDetails = new ArrayList<>();

    @Column(name = "primary_contact_person_full")
    private String primaryContactPersonFull;

    @Column(name = "active")
    private Boolean active = Boolean.TRUE;
}
