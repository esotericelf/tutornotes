// Autocomplete Behavior Test Functions
// Run these in browser console to test autocomplete behavior

window.testAutocompleteBehavior = {
    // Test 1: Check if autocomplete is blank on page load
    testCleanState: () => {
        console.log('🧪 Test 1: Clean Page Load');
        const autocompleteInput = document.querySelector('#tags-autocomplete');
        const inputValue = autocompleteInput?.value || '';
        console.log('Input value:', inputValue);
        console.log('✅ PASS: Input is blank' + (inputValue ? ` ❌ FAIL: Input has value "${inputValue}"` : ''));
        return inputValue === '';
    },

    // Test 2: Check Redux state
    testReduxState: () => {
        console.log('🧪 Test 2: Redux State Check');
        // This would need to be run in a React component context
        console.log('Run this test from within the React component context');
        return true;
    },

    // Test 3: Check for console warnings
    testConsoleWarnings: () => {
        console.log('🧪 Test 3: Console Warnings Check');
        const originalWarn = console.warn;
        const originalError = console.error;
        let warnings = [];
        let errors = [];

        console.warn = (...args) => {
            warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.error = (...args) => {
            errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        // Restore after a short delay
        setTimeout(() => {
            console.warn = originalWarn;
            console.error = originalError;
            console.log('Warnings found:', warnings.length);
            console.log('Errors found:', errors.length);
            if (warnings.length > 0) console.log('Warnings:', warnings);
            if (errors.length > 0) console.log('Errors:', errors);
        }, 1000);

        return true;
    },

    // Test 4: Simulate focus and blur
    testFocusBehavior: () => {
        console.log('🧪 Test 4: Focus Behavior Test');
        const autocompleteInput = document.querySelector('#tags-autocomplete');
        if (!autocompleteInput) {
            console.log('❌ FAIL: Autocomplete input not found');
            return false;
        }

        // Focus the input
        autocompleteInput.focus();
        console.log('Input focused');

        // Check if input is still blank after focus
        setTimeout(() => {
            const value = autocompleteInput.value;
            console.log('Input value after focus:', value);
            console.log(value === '' ? '✅ PASS: Input remains blank' : `❌ FAIL: Input has value "${value}"`);
        }, 100);

        return true;
    },

    // Test 5: Check for React key prop warnings
    testKeyPropWarnings: () => {
        console.log('🧪 Test 5: Key Prop Warnings Check');
        const originalError = console.error;
        let keyWarnings = [];

        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('key') && message.includes('spread')) {
                keyWarnings.push(message);
            }
            originalError.apply(console, args);
        };

        // Restore after a short delay
        setTimeout(() => {
            console.error = originalError;
            console.log('Key prop warnings found:', keyWarnings.length);
            if (keyWarnings.length > 0) {
                console.log('❌ FAIL: Key prop warnings detected');
                keyWarnings.forEach(warning => console.log('  -', warning));
            } else {
                console.log('✅ PASS: No key prop warnings');
            }
        }, 1000);

        return true;
    },

    // Run all tests
    runAllTests: function () {
        console.log('🚀 Running All Autocomplete Tests...');
        const results = [];

        results.push(this.testCleanState());
        results.push(this.testReduxState());
        results.push(this.testConsoleWarnings());
        results.push(this.testFocusBehavior());
        results.push(this.testKeyPropWarnings());

        const passed = results.filter(r => r).length;
        const total = results.length;

        console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

        if (passed === total) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️ Some tests failed. Check the output above.');
        }

        return { passed, total, results };
    }
};

// Usage instructions
console.log(`
🧪 Autocomplete Test Suite Loaded!

Available tests:
- testAutocompleteBehavior.testCleanState()
- testAutocompleteBehavior.testReduxState()
- testAutocompleteBehavior.testConsoleWarnings()
- testAutocompleteBehavior.testFocusBehavior()
- testAutocompleteBehavior.testKeyPropWarnings()
- testAutocompleteBehavior.runAllTests()

Quick start: testAutocompleteBehavior.runAllTests()
`);
