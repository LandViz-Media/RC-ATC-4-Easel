(Test RapidChange Tool 3 with Measurement)

G20
G90
G17
G54

G0 Z2.000
M5
M9
G04 P4000

(--- Load Tool 3 using RapidChange subroutine ---)
M98 P633

(--- Measure Tool 3 on tool setter ---)
G53 G90 G0 Z-0.010
G53 G90 G0 X0.315 Y0.273
T3 M6

(--- Return to work zero at safe height ---)
G0 Z2.000
G0 X0.000 Y0.000
G0 Z2.000

M30