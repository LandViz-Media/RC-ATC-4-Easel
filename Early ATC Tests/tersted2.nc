(MASSO Onefinity Elite - Tool Change Test)
(Current tool assumed to be T1)
(Test: Change to Tool 2, probe tool setter, move to X0 Y0)
(No cutting operation)

(Material thickness = 0.75")
(Final clearance height = 2.000")

(Tool setter center location:)
(X = 0.31)
(Y = 0.27)

G20         (Units = Inches)
G90         (Absolute positioning)
G17         (XY plane)
G54         (Work offset)

(--- Safety start ---)
G0 Z2.000

(--- Stop spindle before tool change ---)
M5

(--- Change to Tool 2 ---)
(MASSO handles tool measurement automatically during M6)
(Tool setter located at X0.31 Y0.27)

T2 M6

(--- Spindle remains OFF for this test ---)

(--- Move to work zero location ---)
G0 X0.000 Y0.000

(--- Move to safe clearance height ---)
G0 Z2.000

(--- End program ---)
M5
M30
