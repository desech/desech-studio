# Desech Programming Principles

- [Separation of concerns (SoC)](#separation-of-concerns-(soc))
- [Single responsibility principle (S from SOLID)](#single-responsibility-principle-(solid))
- [Event driven programming](#event-driven-programming)
- [Procedural programming](#procedural-programming)
- [Hardest problem in programming is `naming things`](#hardest-problem-in-programming-is-naming-things)
- [Write self documenting code with very few comments](#write-self-documenting-code-with-very-few-comments)
- [Keep it simple stupid (KISS)](#keep-it-simple-stupid-(kiss))
- [You aren't gonna need it (YAGNI)](#you-arent-gonna-need-it-(yagni))
- [Don't repeat yourself (DRY)](#dont-repeat-yourself-(dry))
- [Avoid premature optimization](#avoid-premature-optimization)
- [Command query separation (CQS)](#command-query-separation-(cqs))
- [Strategy pattern](#strategy-pattern)
- [Adapter pattern](#adapter-pattern)
- [Limit code dependency](#limit-code-dependency)
- [Use few and simple arguments](#use-few-and-simple-arguments)

## Separation of concerns (SOC)

Separate the logic of the application in different sections/directories, and then each section of code will have its own modules/files.

## Single responsibility principle (SOLID)

A module should only deal with the logic specific to its responsibility. Each module/file must not contain more than 200 lines of code.

This is the main criteria on how to separate your modules. When one module becomes too big, then you need to refactor it and split it into smaller modules.

### Testing (optional)

- For the UI modules we are doing integration testing only on the event methods.

This way we can be more agile and aggressive on redesigning/refactoring the code if needed, while still having tests validating our work, instead of unit testing everything and becoming really hard to redesign/refactor anything without constantly adjusting the unit tests for all the little methods.

## Event driven programming

Client side JavaScript works by attaching event listeners and when they are triggered they execute the corresponding logic. We would like to focus on this natural behavior of JavaScript.

So, first we start by defining the events that our module section needs. Each section will have one event module that only contains code about events. This way we quickly know where to search for event handlers.

## Procedural programming

The module object literal has no state and you call it statically by using `Module.method()`. So no OOP classes, no module instantiation, no inheritance.

Each module will export a default object literal which contains only methods. There are times when we do need object properties for:

- numeric constants, so unit tests can set them to different values.
- storing temporary local state for `optimizing` dragging, mouse moving, double click events, etc.

In most cases we will not have object properties, only methods. When we do have object literal properties, then these are private and should never be called outside the module. To remember that, it's best to add an underscore, like so: `_property` or `_PROPERTY` for constants.

When storing temporary local state, it's important to keep it `temporary`. This means we need to clear it at the end of our events (`mouseover`, `dragend`, etc).

## Hardest problem in programming is `naming things`

File and directory names should be as long as needed. Module file names should be unique without the need to import them with aliases. Adding the path name to the file name helps with that. Example: for this path `/app/js/admin/user/*.js` the file name would be `AdminUserEdit.js` instead of `Edit.js`.

Methods and variables should be as long as needed, describing what they do.

## Write self documenting code with very few comments

Once you name your files, variables, methods, etc descriptive enough, and you keep the code inside a method, short and to the point, then there's no need for many comments. For example if we have a method called `changeEffectFields()` then there's no need for a method comment stating what it does. If it does too much or is not obvious, then it needs refactoring.

Only add comments when there's a need to explain why the code runs in a certain way or needs certain things. If the code can't explain itself then that's a big code smell and it should be refactored.

This will be hard in the beginning if you are not used to it, but it will force you to write short and effective code.

### Effective comments

```javascript
// @todo Implement this later
```

```javascript
// make sure we have at least one rule, so we can identify the selector
if (sheet.cssRules.length === 1) return
```

```javascript
children[1].remove() // don't delete the first child, because it's the `No changes` default element
```

### Ineffective comments

```javascript
// change effect fields
function changeEffectFields()
```

```javascript
// set x to 1
const x = 1
```

```javascript
// loop through y
for (const x of y) {
}
```

## Keep it simple stupid (KISS)

Keep the module methods as short as possible, no more than 10 lines. There are some exceptions when dealing with long `switch/cases` or long object/array assignments.

When a method becomes too large, then we move certain pieces of code into new methods.

We also don't want to get into the other extreme where our methods are very short. This will make following the code harder.

## You aren't gonna need it (YAGNI)

Only implement code that is actually executed. For example, don't implement a `getFoo()` method because you have a `setFoo()` one.

## Don't repeat yourself (DRY)

Instead of duplicating code, write one module or method that abstracts that code and then call it where needed. In the end you have one method and one unit test instead of 2 of each. Helps a lot with code maintenance.

Sometimes a bit of duplication is needed when using the `Strategy` pattern. If you go too extreme into `DRY` then the methods will be very complex in order to adapt to all sort of situations. Try to mix `KISS` and `DRY` to get the best of both, if possible.

## Avoid premature optimization

If something is slow on your dev environment then you need to make sure it performs fast enough, because it's going to be even slower on the server. But if things run smoothly on your machine and your server, then don't start prematurely optimizing for the future 1 million concurrent users you may, or may not have.

As a general rule, only use `recursion`, complex `regular expressions`, big `for loops` when really needed.  Don't spend time on optimizing small things like string manipulation, caching data, preloading data, etc.

For example, if you have a `mouse move` event and you are doing some heavy initialization, then yes, cache that data into a temporary locale state module property, otherwise it's going to be quite slow.

If you are looking for 3rd party software/libraries and performance is needed in that department, then yes, do your research in finding the best one for your needs, including performance.

## Command query separation (CQS)

If a method returns something, then it shouldn't also set something else. To avoid side effects inside methods, `getters` should only retrieve data and leave the setting of data to `setters`.

This only applies to the leaf methods that do only one thing. Unfortunately the more complex methods that just call out other methods to accomplish a task, will have to sometimes call getters and setters methods, and that's ok.

## Strategy pattern

You can use the strategy pattern by creating a method that retrieves the corresponding module type. For example:

```javascript
// file = EffectType.js
import EffectFilter from './type/EffectFilter.js'
import EffectTransform from './type/EffectTransform.js'

export default {
  getModule (type) {
    const modules = {
      filter: EffectFilter,
      transform: EffectTransform
    }
    return modules[type]
  },

  injectList (type) {
    this.getModule(type).injectList()
  }
}
```

When you call `EffectType.injectList('transform')`, it will then call the `EffectTransform.injectList()`.

## Adapter pattern

Instead of importing 3rd party libraries directly into our main code, we should use an adapter module. The adapter module will define all the calls that we need in our code. This way if we ever need to upgrade the library or migrate to a different library, then we just change the adapter module, instead of changing our entire code base.

Important note here: this applies to our main executing code, not to our dev tools that unit test, merge, parse, etc.

The adapter pattern can't be used for frameworks or libraries like react, angular, etc.

## Limit code dependency

We are talking here about reducing the number of 3rd party libraries and being very careful on what libraries we add. That does not mean we should not import any library and develop everything ourselves.

If you are able to implement the logic yourself and it's not such a big task, then you should probably do so yourself, instead of relying on other 3rd party libraries.

### PROS for having lots of libraries

- Someone else is dealing with the bug fixing, security, improving code, etc, and you can focus on your own application code.
- The pros apply only when the library is mature, well documented, has good versioning and a big user base.

### CONS for having lots of libraries

- It's harder to debug and bug fix libraries than your own code.
- You need to setup their own dev environment to push a pull request.
- You need to wait on the library bug fixing process or else you are forced to fork the library.
- You need to fix your own code for non backwards-compatible features or even new library versions.
- Libraries can sometimes loose people's interest and then there's no one working on them.
- Most of the time libraries have their own initialization and dependencies which decrease the performance.
- If we deal with client code, then the library will increase your js file size.
- Potential security risk, since more people know this library.

## Use few and simple arguments

If a method has few simple arguments, then it's very easy to re-use the method.

For example `addPlacementMarker(event)` will be much more complex to re-use because you need to pass an entire `event` object, compared to using it like `addPlacementMarker (event.target, event.clientY)`.

Yes we do have 2 arguments, but `event.clientY` can now be re-used as a fixed `Y` position taken from somewhere else besides the event object. This makes the method more usable and versatile, than hard-coding the `event` object in the argument list.

In a way we need to balance the `few` and `simple` arguments aspect. Sometimes 2 simple arguments are easier to use, than one complex argument.
