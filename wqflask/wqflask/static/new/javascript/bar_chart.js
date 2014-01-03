// Generated by CoffeeScript 1.6.1
(function() {
  var Bar_Chart, root,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Bar_Chart = (function() {

    function Bar_Chart(sample_list, sample_group) {
      var longest_sample_name, sample,
        _this = this;
      this.sample_list = sample_list;
      this.sample_group = sample_group;
      this.sort_by = "name";
      this.get_samples();
      console.log("sample names:", this.sample_names);
      if (this.sample_attr_vals.length > 0) {
        this.get_distinct_attr_vals();
        this.get_attr_color_dict(this.distinct_attr_vals);
      }
      longest_sample_name = d3.max((function() {
        var _i, _len, _ref, _results;
        _ref = this.sample_names;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sample = _ref[_i];
          _results.push(sample.length);
        }
        return _results;
      }).call(this));
      this.margin = {
        top: 20,
        right: 20,
        bottom: longest_sample_name * 7,
        left: 40
      };
      this.plot_width = this.sample_vals.length * 15 - this.margin.left - this.margin.right;
      this.plot_height = 500 - this.margin.top - this.margin.bottom;
      this.x_buffer = this.plot_width / 20;
      this.y_buffer = this.plot_height / 20;
      this.y_min = d3.min(this.sample_vals);
      this.y_max = d3.max(this.sample_vals) * 1.1;
      this.svg = this.create_svg();
      this.plot_height -= this.y_buffer;
      this.create_scales();
      this.create_graph();
      d3.select("#color_attribute").on("change", function() {
        _this.attribute = $("#color_attribute").val();
        console.log("attr_color_dict:", _this.attr_color_dict);
        if (_this.sort_by = "name") {
          _this.svg.selectAll(".bar").data(_this.sorted_samples()).transition().duration(1000).style("fill", function(d) {
            if (_this.attribute === "None") {
              return "steelblue";
            } else {
              return _this.attr_color_dict[_this.attribute][d[2][_this.attribute]];
            }
          }).select("title").text(function(d) {
            return d[1];
          });
        } else {
          _this.svg.selectAll(".bar").data(_this.samples).transition().duration(1000).style("fill", function(d) {
            if (_this.attribute === "None") {
              return "steelblue";
            } else {
              return _this.attr_color_dict[_this.attribute][d[2][_this.attribute]];
            }
          });
        }
        return _this.add_legend(_this.attribute, _this.distinct_attr_vals[_this.attribute]);
      });
      $(".sort_by_value").on("click", function() {
        console.log("sorting by value");
        _this.sort_by = "value";
        if (_this.attributes.length > 0) {
          _this.attribute = $("#color_attribute").val();
        }
        return _this.rebuild_bar_graph(_this.sorted_samples());
      });
      $(".sort_by_name").on("click", function() {
        console.log("sorting by name");
        _this.sort_by = "name";
        if (_this.attributes.length > 0) {
          _this.attribute = $("#color_attribute").val();
        }
        return _this.rebuild_bar_graph(_this.samples);
      });
      d3.select("#color_by_trait").on("click", function() {
        return _this.open_trait_selection();
      });
    }

    Bar_Chart.prototype.rebuild_bar_graph = function(samples) {
      var sample, sample_names, x_scale,
        _this = this;
      console.log("samples:", samples);
      this.svg.selectAll(".bar").data(samples).transition().duration(1000).style("fill", function(d) {
        if (_this.attributes.length === 0 && (_this.trait_color_dict != null)) {
          console.log("SAMPLE:", d[0]);
          console.log("CHECKING:", _this.trait_color_dict[d[0]]);
          return _this.trait_color_dict[d[0]];
        } else if (_this.attributes.length > 0 && _this.attribute !== "None") {
          console.log("@attribute:", _this.attribute);
          console.log("d[2]", d[2]);
          console.log("the_color:", _this.attr_color_dict[_this.attribute][d[2][_this.attribute]]);
          return _this.attr_color_dict[_this.attribute][d[2][_this.attribute]];
        } else {
          return "steelblue";
        }
      }).attr("y", function(d) {
        return _this.y_scale(d[1]);
      }).attr("height", function(d) {
        return _this.plot_height - _this.y_scale(d[1]);
      }).select("title").text(function(d) {
        return d[1];
      });
      sample_names = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = samples.length; _i < _len; _i++) {
          sample = samples[_i];
          _results.push(sample[0]);
        }
        return _results;
      })();
      console.log("sample_names2:", sample_names);
      x_scale = d3.scale.ordinal().domain(sample_names).rangeBands([0, this.plot_width], .1);
      $('.x.axis').remove();
      return this.add_x_axis(x_scale);
    };

    Bar_Chart.prototype.get_attr_color_dict = function(vals) {
      var color, color_range, distinct_vals, i, key, this_color_dict, value, _i, _j, _len, _len1, _results,
        _this = this;
      this.attr_color_dict = {};
      console.log("vals:", vals);
      _results = [];
      for (key in vals) {
        if (!__hasProp.call(vals, key)) continue;
        distinct_vals = vals[key];
        this_color_dict = {};
        if (distinct_vals.length < 10) {
          color = d3.scale.category10();
          for (i = _i = 0, _len = distinct_vals.length; _i < _len; i = ++_i) {
            value = distinct_vals[i];
            this_color_dict[value] = color(i);
          }
        } else {
          console.log("distinct_values:", distinct_vals);
          if (_.every(distinct_vals, function(d) {
            if (isNaN(d)) {
              return false;
            } else {
              return true;
            }
          })) {
            color_range = d3.scale.linear().domain([d3.min(distinct_vals), d3.max(distinct_vals)]).range([0, 255]);
            for (i = _j = 0, _len1 = distinct_vals.length; _j < _len1; i = ++_j) {
              value = distinct_vals[i];
              console.log("color_range(value):", parseInt(color_range(value)));
              this_color_dict[value] = d3.rgb(parseInt(color_range(value)), 0, 0);
            }
          }
        }
        _results.push(this.attr_color_dict[key] = this_color_dict);
      }
      return _results;
    };

    Bar_Chart.prototype.get_trait_color_dict = function(samples, vals) {
      var color, color_range, distinct_vals, i, key, sample, this_color_dict, value, _i, _j, _len, _len1, _results,
        _this = this;
      this.trait_color_dict = {};
      console.log("vals:", vals);
      for (key in vals) {
        if (!__hasProp.call(vals, key)) continue;
        distinct_vals = vals[key];
        this_color_dict = {};
        if (distinct_vals.length < 10) {
          color = d3.scale.category10();
          for (i = _i = 0, _len = distinct_vals.length; _i < _len; i = ++_i) {
            value = distinct_vals[i];
            this_color_dict[value] = color(i);
          }
        } else {
          console.log("distinct_values:", distinct_vals);
          if (_.every(distinct_vals, function(d) {
            if (isNaN(d)) {
              return false;
            } else {
              return true;
            }
          })) {
            color_range = d3.scale.linear().domain([d3.min(distinct_vals), d3.max(distinct_vals)]).range([0, 255]);
            for (i = _j = 0, _len1 = distinct_vals.length; _j < _len1; i = ++_j) {
              value = distinct_vals[i];
              console.log("color_range(value):", parseInt(color_range(value)));
              this_color_dict[value] = d3.rgb(parseInt(color_range(value)), 0, 0);
            }
          }
        }
      }
      _results = [];
      for (sample in samples) {
        if (!__hasProp.call(samples, sample)) continue;
        value = samples[sample];
        _results.push(this.trait_color_dict[sample] = this_color_dict[value]);
      }
      return _results;
    };

    Bar_Chart.prototype.convert_into_colors = function(values) {
      var color_range, i, value, _i, _len, _results;
      color_range = d3.scale.linear().domain([d3.min(values), d3.max(values)]).range([0, 255]);
      _results = [];
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        console.log("color_range(value):", color_range(parseInt(value)));
        _results.push(this_color_dict[value] = d3.rgb(color_range(parseInt(value)), 0, 0));
      }
      return _results;
    };

    Bar_Chart.prototype.get_samples = function() {
      var attr_vals, attribute, key, sample, _i, _j, _len, _len1, _ref, _ref1;
      this.sample_names = (function() {
        var _i, _len, _ref, _results;
        _ref = this.sample_list;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sample = _ref[_i];
          if (sample.value !== null) {
            _results.push(sample.name);
          }
        }
        return _results;
      }).call(this);
      this.sample_vals = (function() {
        var _i, _len, _ref, _results;
        _ref = this.sample_list;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sample = _ref[_i];
          if (sample.value !== null) {
            _results.push(sample.value);
          }
        }
        return _results;
      }).call(this);
      this.attributes = (function() {
        var _results;
        _results = [];
        for (key in this.sample_list[0]["extra_attributes"]) {
          _results.push(key);
        }
        return _results;
      }).call(this);
      console.log("attributes:", this.attributes);
      this.sample_attr_vals = [];
      if (this.attributes.length > 0) {
        _ref = this.sample_list;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sample = _ref[_i];
          attr_vals = {};
          _ref1 = this.attributes;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            attribute = _ref1[_j];
            attr_vals[attribute] = sample["extra_attributes"][attribute];
          }
          this.sample_attr_vals.push(attr_vals);
        }
      }
      return this.samples = _.zip(this.sample_names, this.sample_vals, this.sample_attr_vals);
    };

    Bar_Chart.prototype.get_distinct_attr_vals = function() {
      var attribute, sample, _i, _len, _ref, _results;
      this.distinct_attr_vals = {};
      _ref = this.sample_attr_vals;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sample = _ref[_i];
        _results.push((function() {
          var _ref1, _results1;
          _results1 = [];
          for (attribute in sample) {
            if (!this.distinct_attr_vals[attribute]) {
              this.distinct_attr_vals[attribute] = [];
            }
            if (_ref1 = sample[attribute], __indexOf.call(this.distinct_attr_vals[attribute], _ref1) < 0) {
              _results1.push(this.distinct_attr_vals[attribute].push(sample[attribute]));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Bar_Chart.prototype.create_svg = function() {
      var svg;
      svg = d3.select("#bar_chart").append("svg").attr("class", "bar_chart").attr("width", this.plot_width + this.margin.left + this.margin.right).attr("height", this.plot_height + this.margin.top + this.margin.bottom).append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      return svg;
    };

    Bar_Chart.prototype.create_scales = function() {
      this.x_scale = d3.scale.ordinal().domain(this.sample_names).rangeBands([0, this.plot_width], .1);
      return this.y_scale = d3.scale.linear().domain([this.y_min * 0.75, this.y_max]).range([this.plot_height, this.y_buffer]);
    };

    Bar_Chart.prototype.create_graph = function() {
      this.add_x_axis(this.x_scale);
      this.add_y_axis();
      return this.add_bars();
    };

    Bar_Chart.prototype.add_x_axis = function(scale) {
      var xAxis,
        _this = this;
      xAxis = d3.svg.axis().scale(scale).orient("bottom");
      return this.svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.plot_height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").style("font-size", "12px").attr("dx", "-.8em").attr("dy", "-.3em").attr("transform", function(d) {
        return "rotate(-90)";
      });
    };

    Bar_Chart.prototype.add_y_axis = function() {
      var yAxis;
      yAxis = d3.svg.axis().scale(this.y_scale).orient("left").ticks(5);
      return this.svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end");
    };

    Bar_Chart.prototype.add_bars = function() {
      var _this = this;
      return this.svg.selectAll(".bar").data(this.samples).enter().append("rect").style("fill", "steelblue").attr("class", "bar").attr("x", function(d) {
        return _this.x_scale(d[0]);
      }).attr("width", this.x_scale.rangeBand()).attr("y", function(d) {
        return _this.y_scale(d[1]);
      }).attr("height", function(d) {
        return _this.plot_height - _this.y_scale(d[1]);
      }).append("svg:title").text(function(d) {
        return d[1];
      });
    };

    Bar_Chart.prototype.sorted_samples = function() {
      var sample_list, sorted,
        _this = this;
      sample_list = _.zip(this.sample_names, this.sample_vals, this.sample_attr_vals);
      sorted = _.sortBy(sample_list, function(sample) {
        return sample[1];
      });
      console.log("sorted:", sorted);
      return sorted;
    };

    Bar_Chart.prototype.add_legend = function(attribute, distinct_vals) {
      var legend, legend_rect, legend_text,
        _this = this;
      legend = this.svg.append("g").attr("class", "legend").attr("height", 100).attr("width", 100).attr('transform', 'translate(-20,50)');
      legend_rect = legend.selectAll('rect').data(distinct_vals).enter().append("rect").attr("x", this.plot_width - 65).attr("width", 10).attr("height", 10).attr("y", function(d, i) {
        return i * 20;
      }).style("fill", function(d) {
        console.log("TEST:", _this.attr_color_dict[attribute][d]);
        return _this.attr_color_dict[attribute][d];
      });
      return legend_text = legend.selectAll('text').data(distinct_vals).enter().append("text").attr("x", this.plot_width - 52).attr("y", function(d, i) {
        return i * 20 + 9;
      }).text(function(d) {
        return d;
      });
    };

    Bar_Chart.prototype.open_trait_selection = function() {
      var _this = this;
      return $('#collections_holder').load('/collections/list?color_by_trait #collections_list', function() {
        $.colorbox({
          inline: true,
          href: "#collections_holder"
        });
        return $('a.collection_name').attr('onClick', 'return false');
      });
    };

    Bar_Chart.prototype.color_by_trait = function(trait_sample_data) {
      var distinct_values, trimmed_samples,
        _this = this;
      console.log("BXD1:", trait_sample_data["BXD1"]);
      console.log("trait_sample_data:", trait_sample_data);
      trimmed_samples = this.trim_values(trait_sample_data);
      distinct_values = {};
      distinct_values["collection_trait"] = this.get_distinct_values(trimmed_samples);
      this.get_trait_color_dict(trimmed_samples, distinct_values);
      console.log("TRAIT_COLOR_DICT:", this.trait_color_dict);
      console.log("SAMPLES:", this.samples);
      if (this.sort_by = "value") {
        return this.svg.selectAll(".bar").data(this.samples).transition().duration(1000).style("fill", function(d) {
          console.log("this color:", _this.trait_color_dict[d[0]]);
          return _this.trait_color_dict[d[0]];
        }).select("title").text(function(d) {
          return d[1];
        });
      } else {
        return this.svg.selectAll(".bar").data(this.sorted_samples()).transition().duration(1000).style("fill", function(d) {
          console.log("this color:", _this.trait_color_dict[d[0]]);
          return _this.trait_color_dict[d[0]];
        }).select("title").text(function(d) {
          return d[1];
        });
      }
    };

    Bar_Chart.prototype.trim_values = function(trait_sample_data) {
      var sample, trimmed_samples, _i, _len, _ref;
      trimmed_samples = {};
      _ref = this.sample_names;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sample = _ref[_i];
        if (sample in trait_sample_data) {
          trimmed_samples[sample] = trait_sample_data[sample];
        }
      }
      console.log("trimmed_samples:", trimmed_samples);
      return trimmed_samples;
    };

    Bar_Chart.prototype.get_distinct_values = function(samples) {
      var distinct_values;
      distinct_values = _.uniq(_.values(samples));
      console.log("distinct_values:", distinct_values);
      return distinct_values;
    };

    return Bar_Chart;

  })();

  root.Bar_Chart = Bar_Chart;

}).call(this);
