package com.splitrackr.backend.expenses.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.splitrackr.backend.household.model.Household;
import com.splitrackr.backend.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Expense {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="expense_id", nullable = false)
    @JsonIgnore
    private Integer expenseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @Column(nullable = false)
    private Integer amountCents;

    @Column(nullable = false)
    private Instant dateCreated;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_type", nullable = false)
    private SplitType splitType; // FIXED or EQUAL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status; // ACTIVE or DELETED

    @PrePersist
    void onCreate() {
        if(dateCreated == null) {
            dateCreated = Instant.now();
        }
        if(status == null) {
            status = ExpenseStatus.ACTIVE;
        }
        if(splitType == null) {
            splitType = SplitType.EQUAL;
        }
    }
}
