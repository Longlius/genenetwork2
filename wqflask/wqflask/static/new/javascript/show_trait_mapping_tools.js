// Generated by CoffeeScript 1.3.3
(function() {

  $(function() {
    var composite_mapping_fields, submit_special, toggle_enable_disable;
    submit_special = function() {
      var url;
      console.log("In submit_special");
      console.log("this is:", this);
      console.log("$(this) is:", $(this));
      url = $(this).data("url");
      console.log("url is:", url);
      $("#trait_data_form").attr("action", url);
      return $("#trait_data_form").submit();
    };
    $(".submit_special").click(submit_special);
    composite_mapping_fields = function() {
      return $(".composite_fields").toggle();
    };
    $("#use_composite_choice").change(composite_mapping_fields);
    toggle_enable_disable = function(elem) {
      return $(elem).prop("disabled", !$(elem).prop("disabled"));
    };
    $("#choose_closet_control").change(function() {
      return toggle_enable_disable("#control_locus");
    });
    return $("#display_all_lrs").change(function() {
      return toggle_enable_disable("#suggestive_lrs");
    });
  });

}).call(this);