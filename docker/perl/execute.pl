#!/usr/bin/perl
use strict;
use warnings;

my @code_and_input = <STDIN>;

my $delimiter = "---SPLIT---\n";
my $split_index = 0;
for my $i (0..$#code_and_input) {
    if ($code_and_input[$i] eq $delimiter) {
        $split_index = $i;
        last;
    }
}

my @code = @code_and_input[0..$split_index-1];
my @input_data = @code_and_input[$split_index+1..$#code_and_input];

my $input_file = "/tmp/input.txt";
open(my $input_fh, '>', $input_file) or die "Could not open input file: $!";
print $input_fh @input_data;
close($input_fh);

open(STDIN, '<', $input_file) or die "Could not redirect STDIN: $!";

my $code_str = join('', @code);
eval $code_str;
if ($@) {
    print STDERR $@;
    exit 1;
}
