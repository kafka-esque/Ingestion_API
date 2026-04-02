package api_toolkit.controller;

import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.exception.ResourceConflictException;
import org.springframework.web.bind.annotation.*;

/**
 * Test controller to demonstrate enhanced error handling
 * This controller is for testing purposes only
 */
@RestController
@RequestMapping("/api/test-errors")
@CrossOrigin(origins = "*")
public class ErrorTestController {

    @GetMapping("/not-found")
    public String testNotFound() {
        throw new ResourceNotFoundException("Test resource with ID 123 was not found in the database");
    }

    @GetMapping("/conflict")
    public String testConflict() {
        throw new ResourceConflictException("Test conflict: Resource already exists with the same identifier");
    }

    @GetMapping("/illegal-argument")
    public String testIllegalArgument() {
        throw new IllegalArgumentException("Test illegal argument: Invalid input parameter provided");
    }

    // @GetMapping("/null-pointer")
    // public String testNullPointer() {
    //     String nullString = null;
    //     // This will still throw NullPointerException but makes the intent clearer
    //     if (nullString == null) {
    //         // We intentionally cause NPE for testing error handling
    //         return nullString.length() + "";
    //     }
    //     return "This code will never be reached";
    // }

    @GetMapping("/array-index")
    public String testArrayIndex() {
        int[] array = {1, 2, 3};
        return String.valueOf(array[10]); // This will throw ArrayIndexOutOfBoundsException
    }

    @GetMapping("/arithmetic")
    public String testArithmetic() {
        int result = 10 / 0; // This will throw ArithmeticException
        return String.valueOf(result);
    }
}
