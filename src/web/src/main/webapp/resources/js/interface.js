vdi = {

	fancyboxOptions: {
		overlayShow: true,
		hideOnOverlayClick: false,
		hideOnContentClick: false,
		enableEscapeButton: true,
		showCloseButton: true
	},

	init: function() {
		// Enable Reverse AJAX with DWR
		dwr.engine.setActiveReverseAjax(true);
		dwr.engine.setErrorHandler(function(message, exception) {
			if (typeof window.console != undefined) {
				console.log("Error message is: " + message + " - Error Details: " + dwr.util.toDescriptiveString(exception, 2));
			}
		});

		// Register with manager
		Manager.register();

		$('.vdi-create-vm').fancybox($.extend({
			onStart: $.proxy(this, 'populateVMTypeFamilies'),
			onClosed: $.proxy(this, 'resetCreateDialog')
		}, this.fancyboxOptions));
		$('#vdi-create-vm-type-family').change($.proxy(this, 'populateVMTypes'));

		$('.vdi-mount-image').fancybox($.extend({
			onStart: $.proxy(this, 'populateImages'),
			onClosed: $.proxy(this, 'resetImageDialog')
		}, this.fancyboxOptions));

		// Load VMs
		this.getVMs();

		// VM list buttons
		$('.vdi-machine-start').live('click', $.proxy(this, 'startVM'));
		$('.vdi-machine-pause').live('click', $.proxy(this, 'pauseVM'));
		$('.vdi-machine-stop').live('click', $.proxy(this, 'stopVM'));
		$('.vdi-machine-remove').live('click', $.proxy(this, 'removeVM'));
		$('.vdi-machine-mount').live('click', $.proxy(this, 'prepareMountImage'));
		$('.vdi-machine-eject').live('click', $.proxy(this, 'unmountImage'));

		// Dialog buttons
		$('.vdi-create-vm-button').click($.proxy(this, 'createVM'));
		$('.vdi-mount-image-button').click($.proxy(this, 'mountImage'));

		// Register screenshot refresher
		setInterval($.proxy(this, 'refreshVMScreenshots'), 5*1000);
	},
	
	populateVMTypeFamilies: function() {
		Manager.getVMTypes(function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				var familySelect = $('#vdi-create-vm-type-family');

				familySelect.data('vm_types', response.types);

				$.each(response.types, function(familyName, familyTypes) {
					familySelect.append("<option value='" + familyName + "'>" + familyName + "</option>");
				});
			}
		});
	},
	
	populateVMTypes: function(event) {
		var types = $('#vdi-create-vm-type-family').data('vm_types')[$(event.target).val()];

		var typeSelect = $('#vdi-create-vm-type');
		typeSelect.empty();

		$.each(types, function(typeName, typeDescription) {
			typeSelect.append("<option value='" + typeName + "'>" + typeDescription + "</option>");
		});
	},
	
	getVMs: function() {
		var self = this;
		Manager.getVMs(function(json) {
			var response = $.parseJSON(json);

			console.log(response);

			if (response.success) {
				var vmDrawer = $('.vdi-machine-drawer-machines');

				// Clear machines
				vmDrawer.empty();

				var buttons = {
						start:	"<span class='vdi-machine-start'><img src=\"../resources/images/play.png\"></span>",
						pause:	"<span class='vdi-machine-pause'><img src=\"../resources/images/pause.png\"></span>",
						stop:	"<span class='vdi-machine-stop'><img src=\"../resources/images/stop.png\"></span>",
						disk:	"<span class='vdi-machine-mount'><img src=\"../resources/images/disk.png\"></span>",
						eject:	"<span class='vdi-machine-eject'><img src=\"../resources/images/eject.png\"></span>",
						rdp:	"<img src=\"../resources/images/eye.png\">"
				};

				$.each(response.vms, function(i, vm) {
					var tags = [];
					$.each(vm.tags, function(i, tag) {
						tags.push("<a href='#tag/" + tag.identifier + "'>" + tag.name + "</a>");
					});

					// Visualize VM status
					var status = '',
						active_buttons = [],
						screenshot = "./screenshot/?machine=" + vm.machine_id + "&width=120&height=90&" + (new Date()).getTime(),
						show_paused = "", // false
						rpd_url = "",
						image = vm.image || "",
						disk = vm.image ? buttons.eject : buttons.disk;

					if (vm.status == 'STARTED') {
						status = "Läuft";
						rpd_url = vm.rdp_url;
						var rdp = "<a href=\"./rdp/?machine=" + vm.machine_id + "\" target=\"_blank\">" + buttons.rdp + "</a>";
						active_buttons = [rdp, buttons.pause, disk, buttons.stop];
					} else if (vm.status == 'STOPPED') {
						status = "Ausgeschaltet";

						if (vm.last_active) {
							status += ", zuletzt gestartet " + self.formatDate(vm.last_active);
						}

						active_buttons = [buttons.start, disk];
						screenshot = "../resources/images/machine-off.png";
					} else if (vm.status == 'PAUSED') {
						status = "Angehalten";
						active_buttons = [buttons.start];
						show_paused = true;
					}

					var vmDom = $("<div class='vdi-machine'>"
					+ "	<div class='vdi-machine-remove'><img src=\"../resources/images/delete.png\"></div>"
					+ "	<div class='vdi-machine-screenshot'>"
					+ "		<img src='" + screenshot + "'>"
					+ 		(show_paused && "<img src='../resources/images/machine-paused.png'>")
					+ "	</div>"
					+ "	<div class='vdi-machine-infos'>"
					+ "		<div class='vdi-machine-actions'>"
					+ active_buttons.join("\n")
					+ "		</div>"
					+ "		<span class='vdi-machine-info-title'>Name:</span> " + vm.name + "<br />"
					+ "		<span class='vdi-machine-info-title'>Beschreibung:</span> " + vm.description + "<br />"
					+ "		<span class='vdi-machine-info-title'>Tags:</span> " + tags.join(", ") + "<br />"
					+ "		<span class='vdi-machine-info-title'>Status:</span> " + status + "<br />"
					+ 		(rpd_url && "<span class='vdi-machine-info-title'>RDP:</span> " + rpd_url + "<br />")
					+ 		(image && "<span class='vdi-machine-info-title'>Image:</span> " + image + "<br />")
					+ "	</div>"
					+ "<div class='clear-layout'></div>"
					+ "</div>");

					// Add hidden data for VM
					vmDom.data("machine_id", vm.machine_id);
					vmDom.data("status", vm.status);
					vmDom.data("name", vm.name);

					vmDrawer.append(vmDom);
				});
			}
		});
	},
	
	createVM: function() {
		var name = $("#vdi-create-vm-name").val();
		var type = $("#vdi-create-vm-type").val();
		var description = $("#vdi-create-vm-description").val();
		var memory = $("#vdi-create-vm-memory").val();
		var harddrive = $("#vdi-create-vm-harddrive").val();
		var vram = $("#vdi-create-vm-vram").val();
		var acceleration2d = $("#vdi-create-vm-2d-acceleration").prop("checked");
		var acceleration3d = $("#vdi-create-vm-3d-acceleration").prop("checked");

		// Sanitize input
		memory = parseInt(memory, 10);
		harddrive = parseInt(parseFloat(harddrive.replace(',', '.'), 10) * 1024, 10);
		vram = parseInt(vram, 10);

		var self = this;
		Manager.createVM(name, type, description, memory, harddrive,
				vram, acceleration2d, acceleration3d, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				$.fancybox.close();

				// Reload VMs
				self.getVMs();
			}
		});
	},
	
	getMachineData: function(event) {
		return $(event.target).parents('.vdi-machine').data();
	},
	
	startVM: function(event) {
		var machineId = this.getMachineData(event).machine_id;

		var self = this;
		Manager.startVM(machineId, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				// Reload VMs
				self.getVMs();
			}
		});
	},
	
	pauseVM: function(event) {
		var machineId = this.getMachineData(event).machine_id;

		var self = this;
		Manager.pauseVM(machineId, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				// Reload VMs
				self.getVMs();
			}
		});
	},
	
	stopVM: function(event) {
		var machineId = this.getMachineData(event).machine_id;

		var self = this;
		Manager.stopVM(machineId, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				// Reload VMs
				self.getVMs();
			}
		});
	},
	
	removeVM: function(event) {
		var confirmation = confirm("VM wirklich entfernen?");

		if ( ! confirmation)
			return;

		var machineId = this.getMachineData(event).machine_id;

		var self = this;
		Manager.removeVM(machineId, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				// Reload VMs
				self.getVMs();
			}
		});
	},
	
	resetCreateDialog: function() {
		$('#vdi-create-vm-name').val('');
		$("#vdi-create-vm-type-family option[value!='']").remove();
		$('#vdi-create-vm-type').val('');
		$('#vdi-create-vm-description').val('');
		$('#vdi-create-vm-memory').val('');
		$('#vdi-create-vm-harddrive').val('');
		$('#vdi-create-vm-vram').val('');
		$('#vdi-create-vm-2d-acceleration').prop("checked", false);
		$('#vdi-create-vm-3d-acceleration').prop("checked", false);

		// Clear machine types
		$('#vdi-create-vm-type').empty();
	},

	refreshVMScreenshots: function() {
		$('div.vdi-machine').each(function() {
			var $elem = $(this);

			if($elem.data('status') == 'STARTED') {
				var image = $elem.find('div.vdi-machine-screenshot img');

				image.attr('src', image.attr('src').replace(/(.*)&[0-9]+/, "$1&" + (new Date()).getTime()));
			}
		});
	},

	prepareMountImage: function(event) {
		$('#vdi-mount-image-dialog #vdi-mount-image-machine-id').val(this.getMachineData(event).machine_id);
		$('#vdi-mount-image-dialog .vdi-mount-image-machine-name').text(this.getMachineData(event).name);

		$('.vdi-mount-image').click();
	},

	populateImages: function(event) {
		Manager.getImages(function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				var imageSelect = $('#vdi-mount-image-identifier');

				$.each(response.images, function(i, name) {
					imageSelect.append("<option value='" + name + "'>" + name + "</option>");
				});
			}
		});
	},

	mountImage: function(event) {
		var machineId = $("#vdi-mount-image-machine-id").val();
		var image = $("#vdi-mount-image-identifier").val();

		var self = this;
		Manager.mountImage(machineId, image, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				$.fancybox.close();

				// Reload VMs
				self.getVMs();
			}
		});
	},

	unmountImage: function(event) {
		var machineId = this.getMachineData(event).machine_id;

		var self = this;
		Manager.unmountImage(machineId, function(json) {
			var response = $.parseJSON(json);

			if (response.success) {
				// Reload VMs
				self.getVMs();
			}
		});
	},

	resetImageDialog: function() {
		$('#vdi-mount-image-machine-id').val('');

		// Clear images
		$('#vdi-mount-image-identifier').empty();
	},

	formatDate: function(timestamp) {
		var date = new Date(timestamp);

		return this.padDate(date.getDate()) + "." + this.padDate(date.getMonth() + 1) + "." + this.padDate(date.getFullYear())
			+ ", " + this.padDate(date.getHours()) + ":" + this.padDate(date.getMinutes());
	},

	padDate: function(num) {
		return ("0" + num).slice(-2);
	}

};

$(document).ready(function() {
	vdi.init();
});