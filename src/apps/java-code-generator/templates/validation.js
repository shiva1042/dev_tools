// Validation Templates - Bean Validation, Custom Validators

export const validationTemplates = {
  CUSTOM_VALIDATOR: {
    name: 'Custom Validator',
    description: 'Custom Bean Validation constraints',
    generate: (className, packageName) => ({
      name: 'Custom Validators',
      fileName: 'CustomValidators.java',
      packagePath: `${packageName}.validation`,
      useCase: 'Custom validation annotations for domain-specific rules',
      code: `package ${packageName}.validation;

import jakarta.validation.*;
import java.lang.annotation.*;
import java.util.regex.Pattern;

// ============================================
// PHONE NUMBER VALIDATOR
// ============================================

@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {
    String message() default "Invalid phone number format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String region() default "US";
}

class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private static final Pattern US_PATTERN = Pattern.compile("^\\\\+?1?[-.\\\\s]?\\\\(?\\\\d{3}\\\\)?[-.\\\\s]?\\\\d{3}[-.\\\\s]?\\\\d{4}$");
    private static final Pattern INTERNATIONAL_PATTERN = Pattern.compile("^\\\\+[1-9]\\\\d{1,14}$");

    private String region;

    @Override
    public void initialize(ValidPhoneNumber annotation) {
        this.region = annotation.region();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // Use @NotNull for null checks
        }

        return switch (region) {
            case "US" -> US_PATTERN.matcher(value).matches();
            case "INTERNATIONAL" -> INTERNATIONAL_PATTERN.matcher(value).matches();
            default -> false;
        };
    }
}

// ============================================
// DATE RANGE VALIDATOR
// ============================================

@Documented
@Constraint(validatedBy = DateRangeValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@interface ValidDateRange {
    String message() default "Start date must be before end date";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String startDateField() default "startDate";
    String endDateField() default "endDate";
}

class DateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

    private String startDateField;
    private String endDateField;

    @Override
    public void initialize(ValidDateRange annotation) {
        this.startDateField = annotation.startDateField();
        this.endDateField = annotation.endDateField();
    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        try {
            var startField = obj.getClass().getDeclaredField(startDateField);
            var endField = obj.getClass().getDeclaredField(endDateField);
            startField.setAccessible(true);
            endField.setAccessible(true);

            var startDate = (java.time.LocalDate) startField.get(obj);
            var endDate = (java.time.LocalDate) endField.get(obj);

            if (startDate == null || endDate == null) {
                return true;
            }

            return startDate.isBefore(endDate) || startDate.isEqual(endDate);
        } catch (Exception e) {
            return false;
        }
    }
}

// ============================================
// STRONG PASSWORD VALIDATOR
// ============================================

@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@interface StrongPassword {
    String message() default "Password must be at least 8 characters with uppercase, lowercase, digit, and special character";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    int minLength() default 8;
    boolean requireUppercase() default true;
    boolean requireLowercase() default true;
    boolean requireDigit() default true;
    boolean requireSpecial() default true;
}

class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private int minLength;
    private boolean requireUppercase;
    private boolean requireLowercase;
    private boolean requireDigit;
    private boolean requireSpecial;

    @Override
    public void initialize(StrongPassword annotation) {
        this.minLength = annotation.minLength();
        this.requireUppercase = annotation.requireUppercase();
        this.requireLowercase = annotation.requireLowercase();
        this.requireDigit = annotation.requireDigit();
        this.requireSpecial = annotation.requireSpecial();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        boolean valid = true;

        if (password.length() < minLength) {
            context.buildConstraintViolationWithTemplate(
                "Password must be at least " + minLength + " characters"
            ).addConstraintViolation();
            valid = false;
        }

        if (requireUppercase && !password.matches(".*[A-Z].*")) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one uppercase letter"
            ).addConstraintViolation();
            valid = false;
        }

        if (requireLowercase && !password.matches(".*[a-z].*")) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one lowercase letter"
            ).addConstraintViolation();
            valid = false;
        }

        if (requireDigit && !password.matches(".*\\\\d.*")) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one digit"
            ).addConstraintViolation();
            valid = false;
        }

        if (requireSpecial && !password.matches(".*[!@#$%^&*(),.?\\":{}|<>].*")) {
            context.buildConstraintViolationWithTemplate(
                "Password must contain at least one special character"
            ).addConstraintViolation();
            valid = false;
        }

        return valid;
    }
}

// ============================================
// UNIQUE FIELD VALIDATOR (Database check)
// ============================================

@Documented
@Constraint(validatedBy = {}) // Validator must be configured per entity
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@interface Unique {
    String message() default "Value already exists";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String fieldName();
    Class<?> entityClass();
}

// ============================================
// ENUM VALUE VALIDATOR
// ============================================

@Documented
@Constraint(validatedBy = EnumValueValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@interface ValidEnum {
    String message() default "Invalid enum value";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    Class<? extends Enum<?>> enumClass();
    boolean ignoreCase() default false;
}

class EnumValueValidator implements ConstraintValidator<ValidEnum, String> {

    private java.util.Set<String> validValues;
    private boolean ignoreCase;

    @Override
    public void initialize(ValidEnum annotation) {
        this.ignoreCase = annotation.ignoreCase();
        this.validValues = new java.util.HashSet<>();
        for (var constant : annotation.enumClass().getEnumConstants()) {
            validValues.add(ignoreCase ? constant.name().toUpperCase() : constant.name());
        }
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        String checkValue = ignoreCase ? value.toUpperCase() : value;
        return validValues.contains(checkValue);
    }
}`,
      explanation: 'Collection of custom validation annotations for common use cases.',
      bestPractices: [
        'Return true for null values (use @NotNull separately)',
        'Provide clear error messages',
        'Use constraint composition'
      ],
      commonMistakes: [
        'Not handling null values properly',
        'Complex validation in validators'
      ],
      java21Tips: [
        'Use pattern matching in validators',
        'Switch expressions for region-based validation'
      ]
    })
  },

  VALIDATION_GROUPS: {
    name: 'Validation Groups',
    description: 'Different validation rules for different scenarios',
    generate: (className, packageName) => ({
      name: 'Validation Groups',
      fileName: 'ValidationGroups.java',
      packagePath: `${packageName}.validation`,
      useCase: 'Apply different validation rules for create vs update operations',
      code: `package ${packageName}.validation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.validation.groups.Default;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

// ============================================
// VALIDATION GROUP MARKERS
// ============================================

/**
 * Validation group for create operations
 */
public interface OnCreate {}

/**
 * Validation group for update operations
 */
public interface OnUpdate {}

/**
 * Validation group for patch operations
 */
public interface OnPatch {}

/**
 * Validation group for admin operations
 */
public interface AdminOnly {}

// ============================================
// DTO WITH VALIDATION GROUPS
// ============================================

/**
 * User request DTO with different validation per operation
 */
record ${className}Request(
    @Null(groups = OnCreate.class, message = "ID must be null for create")
    @NotNull(groups = OnUpdate.class, message = "ID is required for update")
    Long id,

    @NotBlank(groups = {OnCreate.class, Default.class})
    @Size(min = 2, max = 100)
    String name,

    @NotBlank(groups = OnCreate.class, message = "Email required for new users")
    @Email
    String email,

    @NotBlank(groups = OnCreate.class, message = "Password required for new users")
    @Null(groups = OnUpdate.class, message = "Use password change endpoint")
    @Size(min = 8, max = 100, groups = OnCreate.class)
    String password,

    @NotNull(groups = AdminOnly.class)
    String role
) {}

// ============================================
// CONTROLLER WITH VALIDATION GROUPS
// ============================================

@RestController
@RequestMapping("/api/v1/${className.toLowerCase()}s")
class ${className}ValidationController {

    /**
     * Create - validates with OnCreate group
     */
    @PostMapping
    public ${className}Response create(
            @Validated(OnCreate.class) @RequestBody ${className}Request request) {
        // ID must be null, email and password required
        return new ${className}Response(1L, request.name(), request.email());
    }

    /**
     * Update - validates with OnUpdate group
     */
    @PutMapping("/{id}")
    public ${className}Response update(
            @PathVariable Long id,
            @Validated(OnUpdate.class) @RequestBody ${className}Request request) {
        // ID required, password must be null
        return new ${className}Response(id, request.name(), request.email());
    }

    /**
     * Patch - validates with OnPatch group (partial update)
     */
    @PatchMapping("/{id}")
    public ${className}Response patch(
            @PathVariable Long id,
            @Validated(OnPatch.class) @RequestBody ${className}Request request) {
        // All fields optional
        return new ${className}Response(id, request.name(), request.email());
    }

    /**
     * Admin create - validates with multiple groups
     */
    @PostMapping("/admin")
    public ${className}Response adminCreate(
            @Validated({OnCreate.class, AdminOnly.class}) @RequestBody ${className}Request request) {
        // Requires OnCreate fields + role
        return new ${className}Response(1L, request.name(), request.email());
    }

    /**
     * Default validation (no explicit group)
     */
    @PostMapping("/quick")
    public ${className}Response quickCreate(@Valid @RequestBody ${className}Request request) {
        // Only validates Default group and non-grouped constraints
        return new ${className}Response(1L, request.name(), request.email());
    }
}

record ${className}Response(Long id, String name, String email) {}

// ============================================
// SEQUENCE VALIDATION (Ordered Groups)
// ============================================

@jakarta.validation.GroupSequence({BasicChecks.class, ComplexChecks.class, Default.class})
interface OrderedValidation {}

interface BasicChecks {}
interface ComplexChecks {}

/**
 * DTO with ordered validation - stops at first group failure
 */
record OrderedValidationRequest(
    @NotBlank(groups = BasicChecks.class)
    String username,

    @Pattern(regexp = "^[a-zA-Z0-9_]+$", groups = ComplexChecks.class,
             message = "Username can only contain letters, numbers, and underscores")
    String usernameForPattern
) {}`,
      explanation: 'Validation groups for different validation scenarios (create/update/admin).',
      bestPractices: [
        'Use groups for operation-specific validation',
        'Include Default.class when needed',
        'Use group sequences for ordered validation'
      ],
      commonMistakes: [
        'Forgetting Default.class in group list',
        'Over-complicating group hierarchies'
      ],
      java21Tips: ['Use records for immutable DTOs with validation']
    })
  },

  CROSS_FIELD_VALIDATION: {
    name: 'Cross-Field Validation',
    description: 'Validate multiple fields together',
    generate: (className, packageName) => ({
      name: 'Cross-Field Validators',
      fileName: 'CrossFieldValidation.java',
      packagePath: `${packageName}.validation`,
      useCase: 'Validate relationships between multiple fields',
      code: `package ${packageName}.validation;

import jakarta.validation.*;
import jakarta.validation.constraintvalidation.SupportedValidationTarget;
import jakarta.validation.constraintvalidation.ValidationTarget;
import java.lang.annotation.*;
import java.lang.reflect.Field;

// ============================================
// FIELDS MUST MATCH (e.g., password confirmation)
// ============================================

@Documented
@Constraint(validatedBy = FieldsMatchValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface FieldsMatch {
    String message() default "Fields do not match";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String field();
    String fieldMatch();

    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        FieldsMatch[] value();
    }
}

class FieldsMatchValidator implements ConstraintValidator<FieldsMatch, Object> {

    private String field;
    private String fieldMatch;

    @Override
    public void initialize(FieldsMatch annotation) {
        this.field = annotation.field();
        this.fieldMatch = annotation.fieldMatch();
    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        try {
            Object fieldValue = getFieldValue(obj, field);
            Object fieldMatchValue = getFieldValue(obj, fieldMatch);

            if (fieldValue == null && fieldMatchValue == null) {
                return true;
            }

            boolean valid = fieldValue != null && fieldValue.equals(fieldMatchValue);

            if (!valid) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                    .addPropertyNode(fieldMatch)
                    .addConstraintViolation();
            }

            return valid;
        } catch (Exception e) {
            return false;
        }
    }

    private Object getFieldValue(Object obj, String fieldName) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }
}

// ============================================
// CONDITIONAL REQUIRED (field required if another has value)
// ============================================

@Documented
@Constraint(validatedBy = ConditionalRequiredValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@interface ConditionalRequired {
    String message() default "Field is required when condition is met";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String conditionalField();
    String[] conditionalValues();
    String requiredField();
}

class ConditionalRequiredValidator implements ConstraintValidator<ConditionalRequired, Object> {

    private String conditionalField;
    private String[] conditionalValues;
    private String requiredField;

    @Override
    public void initialize(ConditionalRequired annotation) {
        this.conditionalField = annotation.conditionalField();
        this.conditionalValues = annotation.conditionalValues();
        this.requiredField = annotation.requiredField();
    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        try {
            Object conditionValue = getFieldValue(obj, conditionalField);
            Object requiredValue = getFieldValue(obj, requiredField);

            // Check if condition is met
            boolean conditionMet = false;
            if (conditionValue != null) {
                for (String value : conditionalValues) {
                    if (value.equals(conditionValue.toString())) {
                        conditionMet = true;
                        break;
                    }
                }
            }

            // If condition met, required field must have value
            if (conditionMet && (requiredValue == null || requiredValue.toString().isBlank())) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    requiredField + " is required when " + conditionalField + " is " + String.join(" or ", conditionalValues)
                ).addPropertyNode(requiredField).addConstraintViolation();
                return false;
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Object getFieldValue(Object obj, String fieldName) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }
}

// ============================================
// EXAMPLE USAGE
// ============================================

@FieldsMatch.List({
    @FieldsMatch(field = "password", fieldMatch = "confirmPassword", message = "Passwords do not match"),
    @FieldsMatch(field = "email", fieldMatch = "confirmEmail", message = "Emails do not match")
})
@ConditionalRequired(
    conditionalField = "paymentMethod",
    conditionalValues = {"CREDIT_CARD"},
    requiredField = "cardNumber",
    message = "Card number is required for credit card payments"
)
record ${className}RegistrationRequest(
    @jakarta.validation.constraints.NotBlank
    String username,

    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Email
    String email,

    String confirmEmail,

    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Size(min = 8)
    String password,

    String confirmPassword,

    String paymentMethod,

    String cardNumber
) {}`,
      explanation: 'Cross-field validation for comparing and conditionally requiring fields.',
      bestPractices: [
        'Add violation to specific field for better error messages',
        'Handle null values gracefully',
        'Use reflection carefully'
      ],
      commonMistakes: [
        'Not disabling default constraint violation',
        'Hardcoded field names without refactoring safety'
      ],
      java21Tips: ['Use records for validated DTOs']
    })
  }
};
