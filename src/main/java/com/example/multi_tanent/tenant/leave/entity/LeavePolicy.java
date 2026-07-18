package com.example.multi_tanent.tenant.leave.entity;

import java.util.Comparator;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.Data;

@Entity
@Table(name = "leave_policies")
@Data
public class LeavePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, name = "default_policy")
    @ColumnDefault("false")
    private Boolean defaultPolicy = false;

    @Column(nullable = true, name = "applies_to_expression")
    private String appliesToExpression;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private Set<LeaveTypePolicy> leaveTypePolicies = new HashSet<>();

    // Custom getter to ensure the list is always sorted in memory.
    public List<LeaveTypePolicy> getLeaveTypePolicies() {
        if (this.leaveTypePolicies != null) {
            List<LeaveTypePolicy> sortedList = new java.util.ArrayList<>(this.leaveTypePolicies);
            sortedList.sort(Comparator.comparing(ltp -> ltp.getLeaveType().getLeaveType()));
            return sortedList;
        }
        return new java.util.ArrayList<>();
    }

    // Custom setter to handle both Lists and Sets, improving robustness.
    public void setLeaveTypePolicies(Collection<LeaveTypePolicy> leaveTypePolicies) {
        this.leaveTypePolicies.clear();
        if (leaveTypePolicies != null) {
            this.leaveTypePolicies.addAll(leaveTypePolicies);
        }
    }
}