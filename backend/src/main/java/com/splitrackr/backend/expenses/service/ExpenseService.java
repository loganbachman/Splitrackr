package com.splitrackr.backend.expenses.service;

import com.splitrackr.backend.expenses.dto.*;
import com.splitrackr.backend.expenses.model.Expense;
import com.splitrackr.backend.expenses.model.ExpenseShare;
import com.splitrackr.backend.expenses.model.ExpenseStatus;
import com.splitrackr.backend.expenses.model.SplitType;
import com.splitrackr.backend.expenses.repository.ExpenseRepository;
import com.splitrackr.backend.expenses.repository.ExpenseShareRepository;
import com.splitrackr.backend.household.model.Household;
import com.splitrackr.backend.household.repository.HouseholdMembershipRepository;
import com.splitrackr.backend.household.repository.HouseholdRepository;
import com.splitrackr.backend.household.service.HouseholdService;
import com.splitrackr.backend.user.User;
import com.splitrackr.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    private final HouseholdRepository householdRepository;

    private final UserRepository userRepository;
    private final HouseholdMembershipRepository householdMembershipRepository;
    private final ExpenseShareRepository expenseShareRepository;

    @Transactional
    public ExpenseResponse createExpense(CreateExpenseRequest request) {
        var user = getAuthenticatedUser();

        var hh = householdRepository.findById(user.getUserHouseholdId()).orElseThrow();

        // get all house member's ids
        List<Integer> memberIds = request.getShare().stream()
                .map(ExpenseShareRequest::getPayerId).toList();

        if(memberIds.isEmpty()) {
            throw new IllegalArgumentException("At least one member required");
        }

        // map to house users
        List<User> members = userRepository.findAllById(memberIds);

        if(memberIds.size() != members.size()) {
            throw new IllegalArgumentException("At least one member wasn't found");
        }

        var expense = Expense.builder()
                .amountCents(request.getAmountCents())
                .payer(user)
                .status(ExpenseStatus.ACTIVE)
                .description(request.getDescription())
                .household(hh)
                .splitType(request.getType())
                .build();
        expenseRepository.save(expense);

        List<ExpenseShare> shares = switch(request.getType()) {
            case EQUAL -> calculateEqual(expense, members, request.getAmountCents());
            case FIXED -> calculateFixed(expense, members, request.getShare(), request.getAmountCents());
        };
        expenseShareRepository.saveAll(shares);

        // build response for shares
        var shareResponse = shares.stream()
                .map(s -> ExpenseShareResponse.builder()
                        .amountCents(s.getAmountCents())
                        .userId(s.getUser().getId())
                        .shareId(s.getShareId())
                        .build())
                .toList();

        return ExpenseResponse.builder()
                .type(request.getType())
                .description(request.getDescription())
                .household(mapToHouseholdDto(expense.getHousehold()))
                .payer(mapToUserDto(expense.getPayer()))
                .amountCents(request.getAmountCents())
                .status(expense.getStatus())
                .id(expense.getExpenseId())
                .shares(shareResponse)
                .build();
    }

    // helper function for equal split
    private List<ExpenseShare> calculateEqual(Expense expense, List<User> members, Integer amountCents) {
        // sort users by id
        var sort = members.stream()
                .sorted(Comparator.comparing(User::getId))
                .toList();
        int n = sort.size();
        if(n <= 0) throw new IllegalArgumentException("At least one member is required");

        int cost = amountCents / n; // cost for each user
        int remainder = amountCents % n;
        var output = new ArrayList<ExpenseShare>(n);

        for(int i = 0; i < n; i++) {
            // distribute remainder on each pass
            int cents = cost + (i < remainder ? 1 : 0);
            output.add(ExpenseShare.builder()
                    .expense(expense)
                    .user(sort.get(i))
                    .amountCents(cents)
                    .build());
        }
        return output;
    }

    // helper function for fixed split
    private List<ExpenseShare> calculateFixed(Expense expense, List<User> members, List<ExpenseShareRequest> shares, Integer amountCents) {

        // map each user to their fixed cents amount in the request
        var fixedAmt = shares.stream().collect(
                Collectors.toMap(ExpenseShareRequest::getPayerId,
                        r -> {
                            Integer cents = r.getAmountCents();
                            if (cents == null) {
                                throw new IllegalArgumentException("Missing fixed amount");
                            }
                            if (cents < 0) {
                                throw new IllegalArgumentException("Negative amount cents not allowed");
                            }
                            return cents;
                }));
        // sort members by id
        var sort = members.stream()
                .sorted(Comparator.comparing(User::getId))
                .toList();
        var output = new ArrayList<ExpenseShare>(sort.size());
        // for each member, build a share
        for(User member : sort) {
            Integer cents = fixedAmt.get(member.getId());
            if(cents == null) {
                throw new IllegalArgumentException("Missing fixed amount");
            }
            output.add(ExpenseShare.builder()
                    .expense(expense)
                    .user(member)
                    .amountCents(cents)
                    .build());
        }
        return output;
    }

    @Transactional
    public List<ExpenseResponse> listExpenses() {
        var user = getAuthenticatedUser();
        Integer houseId = user.getUserHouseholdId();
        if(houseId == null) throw new IllegalArgumentException("No active household for user");

        var hh = householdRepository.findById(user.getUserHouseholdId()).orElseThrow();
        List<Expense> expenses = expenseRepository.findByHousehold_HouseholdIdAndStatusOrderByDateCreatedDesc(
                hh.getHouseholdId(),  ExpenseStatus.ACTIVE
        );

        return expenses.stream()
                .map(e -> ExpenseResponse.builder()
                        .description(e.getDescription())
                        .payer(mapToUserDto(e.getPayer()))
                        .status(e.getStatus())
                        .id(e.getExpenseId())
                        .type(e.getSplitType())
                        .amountCents(e.getAmountCents())
                        .shares(expenseShareRepository.findByExpense(e)
                                .stream()
                                .map(s -> ExpenseShareResponse.builder()
                                        .shareId(s.getShareId())
                                        .userId(s.getUser().getId())
                                        .amountCents(s.getAmountCents())
                                        .build())
                                .toList()
                        )
                        .household(mapToHouseholdDto(e.getHousehold()))
                        .build())
                .toList();
    }

    @Transactional
    public ExpenseResponse getExpense(Integer expenseId) {
        var user = getAuthenticatedUser();

        var expense =  expenseRepository.findById(expenseId).orElseThrow();

        if(!expense.getHousehold().getHouseholdId().equals(user.getUserHouseholdId())) {
            throw new AccessDeniedException("You are not allowed to view this expense");
        }

        if (expense.getStatus() == ExpenseStatus.DELETED) {
            throw new IllegalArgumentException("Expense not found");
        }

        var shares = expenseShareRepository.findByExpense(expense).stream()
                .map(s -> ExpenseShareResponse.builder()
                .shareId(s.getShareId())
                        .userId(s.getUser().getId())
                        .amountCents(s.getAmountCents())
                                .build())
                .toList();

        return ExpenseResponse.builder()
                .description(expense.getDescription())
                .payer(mapToUserDto(expense.getPayer()))
                .status(expense.getStatus())
                .id(expenseId)
                .type(expense.getSplitType())
                .amountCents(expense.getAmountCents())
                .shares(shares)
                .household(mapToHouseholdDto(expense.getHousehold()))
                .build();
    }

    @Transactional
    public ExpenseResponse updateExpense(Integer expenseId, UpdateExpenseRequest request) {
        var user = getAuthenticatedUser();

        var expense =  expenseRepository.findById(expenseId).orElseThrow();

        if(!expense.getHousehold().getHouseholdId().equals(user.getUserHouseholdId())) {
            throw new AccessDeniedException("You are not allowed to view this expense");
        }

        if (expense.getStatus() == ExpenseStatus.DELETED) {
            throw new IllegalArgumentException("Expense not found");
        }

        expense.setAmountCents(request.getAmountCents());
        expense.setDescription(request.getDescription());
        expenseRepository.save(expense);

        // get existing shares to find the users
        List<ExpenseShare> existingShares = expenseShareRepository.findByExpense(expense);
        List<User> members = existingShares.stream()
                .map(ExpenseShare::getUser)
                .toList();

        // delete the previous shares
        expenseShareRepository.deleteByExpense(expense);

        // recalculate shares
        List<ExpenseShare> newShares = switch(expense.getSplitType()) {
            case EQUAL, FIXED -> calculateEqual(expense, members, request.getAmountCents());
        };

        expenseShareRepository.saveAll(newShares);

        // Build response
        var shares = newShares.stream()
                .map(s -> ExpenseShareResponse.builder()
                        .shareId(s.getShareId())
                        .userId(s.getUser().getId())
                        .amountCents(s.getAmountCents())
                        .build())
                .toList();

        return ExpenseResponse.builder()
                .description(expense.getDescription())
                .payer(mapToUserDto(expense.getPayer()))
                .status(expense.getStatus())
                .id(expenseId)
                .type(expense.getSplitType())
                .amountCents(expense.getAmountCents())
                .shares(shares)
                .household(mapToHouseholdDto(expense.getHousehold()))
                .build();

    }

    @Transactional
    public List<ExpenseResponse> getUserExpenses() {
        var user = getAuthenticatedUser();

        List<Expense> expenses = expenseRepository.findByPayer_IdAndStatusOrderByDateCreatedDesc(
                user.getId(), ExpenseStatus.ACTIVE
        );

        return expenses.stream()
                .map(e -> ExpenseResponse.builder()
                        .description(e.getDescription())
                        .payer(mapToUserDto(e.getPayer()))
                        .status(e.getStatus())
                        .id(e.getExpenseId())
                        .type(e.getSplitType())
                        .amountCents(e.getAmountCents())
                        .shares(expenseShareRepository.findByExpense(e)
                                .stream()
                                .map(s -> ExpenseShareResponse.builder()
                                        .shareId(s.getShareId())
                                        .userId(s.getUser().getId())
                                        .amountCents(s.getAmountCents())
                                        .build())
                                .toList()
                        )
                        .household(mapToHouseholdDto(e.getHousehold()))
                        .build())
                .toList();
    }

    @Transactional
    public void deleteExpense(Integer expenseId) {
        var user = getAuthenticatedUser();

        var expense = expenseRepository.findById(expenseId).orElseThrow();

        if(!expense.getHousehold().getHouseholdId().equals(user.getUserHouseholdId())) {
            throw new AccessDeniedException("You are not allowed to view this expense");
        }

        expense.setStatus(ExpenseStatus.DELETED);
        expenseRepository.save(expense);
    }

    // helper for expense dto
    private ExpenseResponse.HouseholdDto mapToHouseholdDto(Household household) {
        return ExpenseResponse.HouseholdDto.builder()
                .householdId(household.getHouseholdId())
                .name(household.getHouseholdName()) // Adjust field name based on your Household entity
                .build();
    }

    // helper for expense dto
    private ExpenseResponse.UserDto mapToUserDto(User user) {
        return ExpenseResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstname()) // Adjust field names based on your User entity
                .lastName(user.getLastname())
                .build();
    }

    // helper for authenticating user
    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
