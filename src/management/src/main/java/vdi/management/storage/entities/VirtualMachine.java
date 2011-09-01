package vdi.management.storage.entities;

import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.ForeignKey;

import vdi.commons.common.objects.VirtualMachineStatus;

/**
 * VirtualMachine Entity.
 */
@Entity
public class VirtualMachine {

	private Long id;
	private String machineId;
	private String machineName;
	private Date creationDate;
	private String description;
	private User user;
	private String osType;
	private Long memorySize;
	private Long hddSize;
	private VirtualMachineStatus status;
	private Date lastActive;
	private String rdpUrl;
	private List<Tag> tags;
	private String image;
	private long vram;
	private boolean accelerate2d;
	private boolean accelerate3d;

	/**
	 * Default Constructor.
	 */
	public VirtualMachine() { }

	/**
	 * Overloaded constructor.
	 * 
	 * @param machineId
	 *            the machineID
	 * @param machineName
	 *            the machineName
	 * @param creationDate
	 *            the Date of creation
	 * @param description
	 *            the description of this VM
	 * @param user
	 *            the owning user
	 */
	public VirtualMachine(String machineId, String machineName,
			Date creationDate, String description, User user) {
		this.machineId = machineId;
		this.setMachineName(machineName);
		this.creationDate = creationDate;
		this.description = description;
		this.user = user;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID", unique = true, nullable = false)
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Column(name = "MACHINE_ID", nullable = false)
	public String getMachineId() {
		return machineId;
	}

	public void setMachineId(String machineID) {
		this.machineId = machineID;
	}

	@Column(name = "MACHINE_NAME")
	public String getMachineName() {
		return machineName;
	}

	public void setMachineName(String machineName) {
		this.machineName = machineName;
	}

	@Column(name = "CREATION_DATE")
	public Date getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Date date) {
		this.creationDate = date;
	}

	@Column(name = "DESCRIPTION", nullable = true)
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@ManyToOne(optional = false)
	@JoinColumn(name = "USER_ID")
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	@Column(name = "OS_TYPE")
	public String getOsType() {
		return osType;
	}

	public void setOsType(String osType) {
		this.osType = osType;
	}

	@Column(name = "MEMORY_SIZE")
	public Long getMemorySize() {
		return memorySize;
	}

	public void setMemorySize(Long memorySize) {
		this.memorySize = memorySize;
	}

	@Column(name = "HDD_SIZE")
	public Long getHddSize() {
		return hddSize;
	}

	public void setHddSize(Long hddSize) {
		this.hddSize = hddSize;
	}

	// @Column(nullable = false)
	@Enumerated(EnumType.STRING)
	public VirtualMachineStatus getStatus() {
		return status;
	}

	public void setStatus(VirtualMachineStatus status) {
		this.status = status;
	}

	@Column(name = "LAST_ACTIVE")
	public Date getLastActive() {
		return lastActive;
	}

	public void setLastActive(Date lastActive) {
		this.lastActive = lastActive;
	}

	@Column(name = "RDP_URL")
	public String getRdpUrl() {
		return rdpUrl;
	}

	public void setRdpUrl(String rdpUrl) {
		this.rdpUrl = rdpUrl;
	}

	@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinTable(name = "VirtualMachineTags", joinColumns = @JoinColumn(name = "ID"), inverseJoinColumns = @JoinColumn(name = "TAG_ID"))
	@ForeignKey(name = "FK_VirtualMachine_Tag", inverseName = "FK_Tag_VirtualMachine")
	public List<Tag> getTags() {
		return tags;
	}

	public void setTags(List<Tag> tags) {
		this.tags = tags;
	}

	@Column(name = "IMAGE")
	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	@Column(name = "VRAM")
	public long getVram() {
		return vram;
	}

	public void setVram(long vram) {
		this.vram = vram;
	}

	@Column(name = "ACC2D")
	public boolean isAccelerate2d() {
		return accelerate2d;
	}

	public void setAccelerate2d(boolean accelerate2d) {
		this.accelerate2d = accelerate2d;
	}

	@Column(name = "ACC3D")
	public boolean isAccelerate3d() {
		return accelerate3d;
	}

	public void setAccelerate3d(boolean accelerate3d) {
		this.accelerate3d = accelerate3d;
	}

}