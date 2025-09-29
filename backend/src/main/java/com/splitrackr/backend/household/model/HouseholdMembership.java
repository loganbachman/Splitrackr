package com.splitrackr.backend.household.model;

import com.splitrackr.backend.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(
        name = "household_membership",
        uniqueConstraints =
        @UniqueConstraint(name="uc_membership_user_household",
                columnNames = {"user_id", "household_id"}
        ),
        indexes = {
                @Index(name = "ix_membership_user", columnList = "user_id"),
                @Index(name = "ix_membership_household", columnList = "household_id")
        }
)
public class HouseholdMembership {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "household_membership_id")
    private Integer householdMembershipId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable=false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "household_id", nullable=false)
    private Household household;

    @Enumerated(EnumType.STRING)
    private MembershipRole role;

    @Column(nullable=false, updatable=false)
    private Instant joinedDate;

    @PrePersist
    void onCreate() {
        if(joinedDate == null) joinedDate = Instant.now();
    }
}
