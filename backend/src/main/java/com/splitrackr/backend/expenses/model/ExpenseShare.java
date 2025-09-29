package com.splitrackr.backend.expenses.model;

import com.splitrackr.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ExpenseShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shareId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer amountCents;
}
