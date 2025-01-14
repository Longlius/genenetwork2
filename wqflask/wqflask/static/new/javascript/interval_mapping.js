// Generated by CoffeeScript 1.8.0
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$(function() {
  var Interval_Map;
  Interval_Map = (function() {
    function Interval_Map(plot_height, plot_width) {
      var _ref;
      this.plot_height = plot_height;
      this.plot_width = plot_width;
      this.qtl_results = js_data.qtl_results;
      console.log("qtl_results are:", this.qtl_results);
      this.chromosomes = js_data.chromosomes;
      this.total_length = 0;
      this.max_chr = this.get_max_chr();
      this.x_coords = [];
      this.y_coords = [];
      this.marker_names = [];
      console.time('Create coordinates');
      this.create_coordinates();
      console.log("@x_coords: ", this.x_coords);
      console.log("@y_coords: ", this.y_coords);
      console.timeEnd('Create coordinates');
      _ref = this.get_chr_lengths(), this.chr_lengths = _ref[0], this.cumulative_chr_lengths = _ref[1];
      this.x_buffer = this.plot_width / 30;
      this.y_buffer = this.plot_height / 20;
      this.x_max = this.total_length;
      console.log("@x_max: ", this.x_max);
      console.log("@x_buffer: ", this.x_buffer);
      this.y_max = d3.max(this.y_coords) * 1.2;
      this.svg = this.create_svg();
      this.plot_coordinates = _.zip(this.x_coords, this.y_coords, this.marker_names);
      this.plot_height -= this.y_buffer;
      this.create_scales();
      console.time('Create graph');
      this.create_graph();
      console.timeEnd('Create graph');
    }

    Interval_Map.prototype.get_max_chr = function() {
      var chr, max_chr, result, _i, _len, _ref;
      max_chr = 0;
      _ref = this.qtl_results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        chr = parseInt(result.chr);
        if (!_.isNaN(chr)) {
          if (chr > max_chr) {
            max_chr = chr;
          }
        }
      }
      return max_chr;
    };

    Interval_Map.prototype.get_chr_lengths = function() {

      /*
       *Gets a list of both individual and cumulative (the position of one on the graph
       *is its own length plus the lengths of all preceding chromosomes) lengths in order
       *to draw the vertical lines separating chromosomes and the chromosome labels
       *
       */
      var chr_lengths, cumulative_chr_lengths, key, this_length, total_length;
      console.log("@chromosomes: ", this.chromosomes);
      cumulative_chr_lengths = [];
      chr_lengths = [];
      total_length = 0;
      for (key in this.chromosomes) {
        this_length = this.chromosomes[key];
        chr_lengths.push(this_length);
        cumulative_chr_lengths.push(total_length + this_length);
        total_length += this_length;
      }
      console.log("chr_lengths: ", chr_lengths);
      return [chr_lengths, cumulative_chr_lengths];
    };

    Interval_Map.prototype.create_coordinates = function() {
      var chr_length, chr_lengths, chr_seen, result, _i, _len, _ref, _ref1;
      chr_lengths = [];
      chr_seen = [];
      _ref = js_data.qtl_results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        if (result.chr === "X") {
          chr_length = parseFloat(this.chromosomes[20]);
        } else {
          chr_length = parseFloat(this.chromosomes[result.chr]);
        }
        if (!(_ref1 = result.chr, __indexOf.call(chr_seen, _ref1) >= 0)) {
          chr_seen.push(result.chr);
          chr_lengths.push(chr_length);
          if (result.chr !== "1") {
            this.total_length += parseFloat(chr_lengths[chr_lengths.length - 2]);
          }
        }
        this.x_coords.push(this.total_length + parseFloat(result.Mb));
        this.y_coords.push(result.lrs_value);
        this.marker_names.push(result.name);
      }
      return this.total_length += parseFloat(chr_lengths[chr_lengths.length - 1]);
    };

    Interval_Map.prototype.create_svg = function() {
      var svg;
      svg = d3.select("#interval_map").append("svg").attr("class", "interval_map").attr("width", this.plot_width + this.x_buffer).attr("height", this.plot_height + this.y_buffer);
      return svg;
    };

    Interval_Map.prototype.create_graph = function() {
      this.add_border();
      this.add_x_axis();
      this.add_y_axis();
      this.add_chr_lines();
      this.fill_chr_areas();
      this.add_chr_labels();
      return this.connect_markers();
    };

    Interval_Map.prototype.add_border = function() {
      var border_coords;
      border_coords = [[this.y_buffer, this.plot_height, this.x_buffer, this.x_buffer], [this.y_buffer, this.plot_height, this.plot_width, this.plot_width], [this.y_buffer, this.y_buffer, this.x_buffer, this.plot_width], [this.plot_height, this.plot_height, this.x_buffer, this.plot_width]];
      return this.svg.selectAll("line").data(border_coords).enter().append("line").attr("y1", (function(_this) {
        return function(d) {
          return d[0];
        };
      })(this)).attr("y2", (function(_this) {
        return function(d) {
          return d[1];
        };
      })(this)).attr("x1", (function(_this) {
        return function(d) {
          return d[2];
        };
      })(this)).attr("x2", (function(_this) {
        return function(d) {
          return d[3];
        };
      })(this)).style("stroke", "#000");
    };

    Interval_Map.prototype.create_scales = function() {
      this.x_scale = d3.scale.linear().domain([0, d3.max(this.x_coords)]).range([this.x_buffer, this.plot_width]);
      return this.y_scale = d3.scale.linear().domain([0, this.y_max]).range([this.plot_height, this.y_buffer]);
    };

    Interval_Map.prototype.create_x_axis_tick_values = function() {
      var chr_ticks, i, length, tick, tick_count, tick_val, tick_vals, val, _i, _j, _k, _len, _ref, _ref1, _ref2;
      tick_vals = [];
      for (val = _i = 25, _ref = this.cumulative_chr_lengths[0]; 25 <= _ref ? _i <= _ref : _i >= _ref; val = 25 <= _ref ? ++_i : --_i) {
        if (val % 25 === 0) {
          tick_vals.push(val);
        }
      }
      _ref1 = this.cumulative_chr_lengths;
      for (i = _j = 0, _len = _ref1.length; _j < _len; i = ++_j) {
        length = _ref1[i];
        if (i === 0) {
          continue;
        }
        chr_ticks = [];
        tick_count = Math.floor(this.chr_lengths[i] / 25);
        tick_val = parseInt(this.cumulative_chr_lengths[i - 1]);
        for (tick = _k = 0, _ref2 = tick_count - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; tick = 0 <= _ref2 ? ++_k : --_k) {
          tick_val += 25;
          chr_ticks.push(tick_val);
        }
        Array.prototype.push.apply(tick_vals, chr_ticks);
      }
      return tick_vals;
    };

    Interval_Map.prototype.add_x_axis = function() {
      var next_chr, tmp_tick_val, xAxis;
      xAxis = d3.svg.axis().scale(this.x_scale).orient("bottom").tickValues(this.create_x_axis_tick_values());
      next_chr = 1;
      tmp_tick_val = 0;
      xAxis.tickFormat((function(_this) {
        return function(d) {
          var next_chr_length, tick_val;
          d3.format("d");
          if (d < _this.cumulative_chr_lengths[0]) {
            tick_val = d;
          } else {
            next_chr_length = _this.cumulative_chr_lengths[next_chr];
            if (d > next_chr_length) {
              next_chr += 1;
              tmp_tick_val = 25;
              tick_val = tmp_tick_val;
            } else {
              tmp_tick_val += 25;
              tick_val = tmp_tick_val;
            }
          }
          return tick_val;
        };
      })(this));
      return this.svg.append("g").attr("class", "x_axis").attr("transform", "translate(0," + this.plot_height + ")").call(xAxis).selectAll("text").attr("text-anchor", "right").attr("dx", "-1.6em").attr("transform", (function(_this) {
        return function(d) {
          return "translate(-12,0) rotate(-90)";
        };
      })(this));
    };

    Interval_Map.prototype.add_y_axis = function() {
      var yAxis;
      yAxis = d3.svg.axis().scale(this.y_scale).orient("left").ticks(5);
      return this.svg.append("g").attr("class", "y_axis").attr("transform", "translate(" + this.x_buffer + ",0)").call(yAxis);
    };

    Interval_Map.prototype.add_chr_lines = function() {
      return this.svg.selectAll("line").data(this.cumulative_chr_lengths, (function(_this) {
        return function(d) {
          return d;
        };
      })(this)).enter().append("line").attr("y1", this.y_buffer).attr("y2", this.plot_height).attr("x1", this.x_scale).attr("x2", this.x_scale).style("stroke", "#ccc");
    };

    Interval_Map.prototype.fill_chr_areas = function() {
      return this.svg.selectAll("rect.chr_fill_area_1").data(_.zip(this.chr_lengths, this.cumulative_chr_lengths), (function(_this) {
        return function(d) {
          return d;
        };
      })(this)).enter().append("rect").attr("class", "chr_fill_area_1").attr("x", (function(_this) {
        return function(d, i) {
          if (i === 0) {
            return _this.x_scale(0);
          } else {
            return _this.x_scale(_this.cumulative_chr_lengths[i - 1]);
          }
        };
      })(this)).attr("y", this.y_buffer).attr("width", (function(_this) {
        return function(d) {
          return _this.x_scale(d[0]);
        };
      })(this)).attr("height", this.plot_height - this.y_buffer).attr("fill", "white");
    };

    Interval_Map.prototype.add_chr_labels = function() {
      var chr_info, chr_names, key;
      chr_names = [];
      for (key in this.chromosomes) {
        chr_names.push(key);
      }
      chr_info = _.zip(chr_names, this.chr_lengths, this.cumulative_chr_lengths);
      return this.svg.selectAll("text").data(chr_info, (function(_this) {
        return function(d) {
          return d;
        };
      })(this)).enter().append("text").text((function(_this) {
        return function(d) {
          return d[0];
        };
      })(this)).attr("x", (function(_this) {
        return function(d) {
          return _this.x_scale(d[2] - d[1] / 2);
        };
      })(this)).attr("y", this.plot_height * 0.1).attr("dx", "0em").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("font-size", "18px");
    };

    Interval_Map.prototype.connect_markers = function() {
      return this.svg.selectAll("line").data(this.plot_coordinates).enter().append("line").attr("x1", (function(_this) {
        return function(d, i) {
          if (i === 0) {
            return _this.x_buffer;
          } else {
            return parseFloat(_this.x_buffer) + ((parseFloat(_this.plot_width) - parseFloat(_this.x_buffer)) * _this.plot_coordinates[i - 1][0] / parseFloat(_this.x_max));
          }
        };
      })(this)).attr("y1", (function(_this) {
        return function(d, i) {
          if (i === 0) {
            return _this.plot_height;
          } else {
            return _this.plot_height - ((_this.plot_height - _this.y_buffer) * _this.plot_coordinates[i - 1][1] / _this.y_max);
          }
        };
      })(this)).attr("x2", (function(_this) {
        return function(d) {
          return parseFloat(_this.x_buffer) + ((parseFloat(_this.plot_width) - parseFloat(_this.x_buffer)) * d[0] / parseFloat(_this.x_max));
        };
      })(this)).attr("y2", (function(_this) {
        return function(d) {
          return _this.plot_height - ((_this.plot_height - _this.y_buffer) * d[1] / _this.y_max);
        };
      })(this)).style("stroke", "black");
    };

    return Interval_Map;

  })();
  console.time('Create interval map');
  console.log("TESTING");
  new Interval_Map(600, 1200);
  return console.timeEnd('Create interval map');
});
