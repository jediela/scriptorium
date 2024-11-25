require 'stringio'

code_and_input = STDIN.read

delimiter = '---SPLIT---\n'
code, input_data = code_and_input.split(delimiter, 2)

$stdin = StringIO.new(input_data || '')

begin
  output = StringIO.new
  $stdout = output

  eval(code)

  puts output.string
rescue Exception => e
  STDERR.puts e.message
  exit 1
end
