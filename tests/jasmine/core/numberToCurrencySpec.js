describe('numberToCurrency()', function(){
  it('Should format number to a default USD currency', function() {
    expect(formatcurrency.numberToCurrency(123)).toBe('$123.00');
    expect(formatcurrency.numberToCurrency(123.45)).toBe('$123.45');
    expect(formatcurrency.numberToCurrency(12345.67)).toBe('$12,345.67');
  });
});