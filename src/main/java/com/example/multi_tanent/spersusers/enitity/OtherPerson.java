package com.example.multi_tanent.spersusers.enitity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "other_persons")
@Getter
@Setter
public class OtherPerson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private BaseCustomer party;

    // Fields
    private String salutation;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email_address")
    private String emailAddress;

    @Column(name = "work_phone")
    private String workPhone;

    private String mobile;

    @Column(name = "skype_name_or_number")
    private String skypeNameOrNumber;

    private String designation;
    private String department;
}
