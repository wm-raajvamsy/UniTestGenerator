// Test Case 1: Verify that the onReady event handler is called when the page is ready
describe('onReady Event Handler', () => {
    it('should call the onReady function when the page is ready', () => {
        // Mock the Page.onReady event
        const mockOnReady = jest.fn();
        Page.onReady += mockOnReady;

        // Simulate the page being ready
        Page.onReady();

        // Verify that the onReady function was called
        expect(mockOnReady).toHaveBeenCalled();
    });
});

// Test Case 2: Verify that the button1Tap event handler updates the button's caption
describe('button1Tap Event Handler', () => {
    it('should update the button1 caption when tapped', () => {
        // Mock the Page.Widgets.button1 object
        const mockButton1 = { caption: '' };
        Page.Widgets.button1 = mockButton1;

        // Mock the event object
        const mockEvent = {};

        // Call the button1Tap function
        Page.button1Tap(mockEvent, Page.Widgets.button1);

        // Verify that the button1 caption was updated
        expect(mockButton1.caption).toBe('raaj');
    });
});

// Test Case 3: Verify that the text1Change event handler updates the text1 datavalue when the value changes
describe('text1Change Event Handler', () => {
    it('should update the text1 datavalue when the value changes', () => {
        // Mock the Page.Widgets.text1 object
        const mockText1 = { datavalue: '', value: '' };
        Page.Widgets.text1 = mockText1;

        // Mock the event object
        const mockEvent = {};

        // Call the text1Change function with a new value
        Page.text1Change(mockEvent, Page.Widgets.text1, 'new value', 'old value');

        // Verify that the text1 datavalue was updated
        expect(mockText1.datavalue).toBe('new value');
    });

    it('should not update the text1 datavalue when the value does not change', () => {
        // Mock the Page.Widgets.text1 object
        const mockText1 = { datavalue: '', value: '' };
        Page.Widgets.text1 = mockText1;

        // Mock the event object
        const mockEvent = {};

        // Call the text1Change function with the same old and new values
        Page.text1Change(mockEvent, Page.Widgets.text1, 'old value', 'old value');

        // Verify that the text1 datavalue was not updated
        expect(mockText1.datavalue).toBe('');
    });
});