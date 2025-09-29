package com.splitrackr.backend.settlement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.splitrackr.backend.household.model.Household;
import com.splitrackr.backend.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Integer settlementId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "household_id")
    private Household householdId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "createdBy_id")
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private SettlementStatus status;

    @Column(name = "period_start")
    private Instant periodStart;

    @NotNull
    @Column(name = "period_end", nullable = false)
    private Instant periodEnd;

    @CreationTimestamp
    @Column(name = "created_at", updatable=false)
    private Instant createdAt;

    @OneToMany(mappedBy = "settlement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SettlementTransfer> transfers = new ArrayList<>();

    @OneToMany(mappedBy = "settlement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SettlementBalance> balances = new ArrayList<>();
}
