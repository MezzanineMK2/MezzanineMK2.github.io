---
layout: post
title:  "Running Commands in Ruby"
date:   2017-08-05 23:30:05 -0400
categories: Ruby
---
When using a script language like Ruby to automate processes, an important function is running external commands.
For example, say we want to run the command `mkdir foo` to create a folder called “foo”
(yes, there are ways to do this directly with “File”, etc). Here are four ways to do that, with one way just being an alias.

{% highlight ruby %}
`mkdir foo`                                         # => ""
%x[mkdir foo]                                       # => ""
system('mkdir foo')                                 # => true
stdin, stdout, stderr = Open3.popen3('mkdir foo')   # => (see below)
{% endhighlight %}

You can choose from one of these depending on the context and what you want to know about the results of the command.

# Backticks: for when you just need the output

The first two examples are backticks and `%x[]`, which is an alias for backticks. They return whatever is output in `stdout`,
so it's useful when you need to read the output of a command in code.

Since most commands will terminate their output with a carriage return, you'll want to `chomp` the output:

{% highlight ruby %}
`pwd`.chomp                 # => "/Users/alex/test"
{% endhighlight %}

Since it doesn't catch any output from `stderr`, you won't be able to read any errors. If you want to mix the errors in with the standard output, you can do that like so:

{% highlight ruby %}
`mkdir foo`                 # => "" (mkdir doesn't print anything)
`mkdir foo`                 # => "" (already exists, but no error)
`mkdir foo 2>&1`            # => "mkdir: foo: File exists\n"
{% endhighlight %}

The `2>&1` part tells the OS to send `stderr` (2) to the same place as `stdout` (1).

Also, if you also want to find out whether the command succeeded or not, you can use the special `$?` object, which represents the last sub-shell command executed.

{% highlight ruby %}
`mkdir foo`                 # => ""
$?.success?                 # => true (first time)
`mkdir foo`                 # => ""
$?.success?                 # => false (second time, already exists)
{% endhighlight %}

Or, if you **only** need to know whether the command succeeded or not, you can use the next method.

# system: for when you just need the result

Executing a shell command using `system('mycommand')` returns whether the command succeeded or not.

{% highlight ruby %}
system('mkdir foo')         # => true (first time)
system('mkdir foo')         # => false (second time, already exists)
{% endhighlight %}

However, this method doesn't capture any output, error or otherwise, so it's more suited to cases when only the success of the command is important. For example:

{% highlight ruby %}
abort 'mkdir failed!' unless system('mkdir foo')
{% endhighlight %}

If the command fails, the program aborts with an error message. Otherwise, the program will continue. Here, we don't care about what was printed, just that it succeeded.

# Open3: for when you need full control

The Open3 library is included with the Ruby standard libraries, but you need to `require` it first. It returns objects representing `stdin`, `stdout`, and `stderr`, all of which you can manipulate individually.

You might want to use this to read standard output and error output individually:

{% highlight ruby %}
stdin, stdout, stderr = Open3.popen3('ls')
stdout.readlines                            # => ["file1.txt\n", "file2.txt\n"]
stderr.readlines                            # => []

stdin, stdout, stderr = Open3.popen3('mkdir foo')
stdout.readlines                            # => []
stderr.readlines                            # => ["mkdir: foo: File exists\n"]
{% endhighlight %}

Also, since you have access to `stdin`, you can provide input for commands that would normally require a user to type manually.

Assuming a command "login" exists that prompts the user for a name and password:

{% highlight ruby %}
stdin, stdout, stderr = Open3.popen3('login')
stdin.puts 'alex'
stdin.puts 'opensesame'
stdin.close
{% endhighlight %}

(No, I have never used "opensesame" as an actual password)