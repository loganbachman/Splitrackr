package com.splitrackr.backend.settlement.model;

import com.splitrackr.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class SettlementTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer transferId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "settlement_id", nullable = false)
    private Settlement settlement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_user_id", nullable=false)
    private User fromUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_user_id", nullable=false)
    private User toUser;

    @Column(name = "amount_cents", nullable = false)
    private Integer amountCents;
}
