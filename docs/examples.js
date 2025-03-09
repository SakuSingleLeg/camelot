// Make an instance of two and place it on the page.
var params = {
  fullscreen: true
};
var elem = document.body;
var two = new Two(params).appendTo(elem);

// Two.js has convenient methods to make shapes and insert them into the scene.
var radius = 50;
var x = two.width * 0.5;
var y = two.height * 0.5 - radius * 1.25;
var circle = two.makeCircle(x, y, radius);

y = two.height * 0.5 + radius * 1.25;
var width = 100;
var height = 100;
var rect = two.makeRectangle(x, y, width, height);

// The object returned has many stylable properties, accepts all valid CSS color:
circle.fill = '#FF8000';
circle.stroke = 'orangered';
circle.linewidth = 5;
rect.fill = 'rgb(0, 200, 255)';
rect.opacity = 0.75;
rect.noStroke();

// Groups can take an array of shapes and/or groups.
var group = two.makeGroup(circle, rect);

// And have position, rotation, scale like all shapes.
group.position.set(two.width / 2, two.height / 2);
group.rotation = Math.PI;
group.scale = 0.75;

// You can also set the same properties a shape have.
group.linewidth = 7;


// Don’t forget to tell two to draw everything to the screen
two.update();