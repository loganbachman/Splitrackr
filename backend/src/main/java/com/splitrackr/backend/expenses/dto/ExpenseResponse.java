package com.splitrackr.backend.expenses.dto;

import ch.qos.logback.core.status.Status;
import com.splitrackr.backend.expenses.model.ExpenseShare;
import com.splitrackr.backend.expenses.model.ExpenseStatus;
import com.splitrackr.backend.expenses.model.SplitType;
import com.splitrackr.backend.household.model.Household;
import com.splitrackr.backend.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Integer id;
    private HouseholdDto household;
    private UserDto payer;
    private Integer amountCents;
    private String description;
    private SplitType type;
    private ExpenseStatus status;
    private List<ExpenseShareResponse> shares;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HouseholdDto {
        private Integer householdId;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Integer id;
        private String email;
        private String firstName;
        private String lastName;
    }
}
