require 'stringio'

code_with_input = STDIN.read
code, input_data = code_with_input.split('---END-CODE---', 2)

$stdin = StringIO.new(input_data || '')

begin
  eval(code)
rescue Exception => e
  STDERR.puts e.message
end
